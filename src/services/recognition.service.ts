import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import prisma from '../lib/prisma.js';

interface CreateRecognitionInput {
  userId: string;
  name: string;
  confidence: number;
  file: Express.Multer.File;
}

const saveImage = async (
  file: Express.Multer.File,
): Promise<string> => {
  const uploadDirectory = path.resolve(
    'uploads',
    'recognitions',
  );

  await fs.mkdir(uploadDirectory, {
    recursive: true,
  });

  const extension =
    path.extname(file.originalname) || '.jpg';

  const filename = `${crypto.randomUUID()}${extension}`;

  const filePath = path.join(
    uploadDirectory,
    filename,
  );

  await fs.writeFile(
    filePath,
    file.buffer,
  );

  return `/uploads/recognitions/${filename}`;
};

export const createRecognition = async ({
  userId,
  name,
  confidence,
  file,
}: CreateRecognitionInput) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error(
      `User not found for recognition: ${userId}`,
    );
  }

  const imageUrl = await saveImage(file);

  console.log('Creating recognition:', {
    userId,
    name,
    confidence,
    imageUrl,
  });

  try {
    return await prisma.recognition.create({
      data: {
        userId,
        name,
        confidence,
        imageUrl,
      },
    });
  } catch (error) {
    // If database creation fails, remove the
    // image that was already saved.
    try {
      const imagePath = path.resolve(
        imageUrl.replace(
          /^\/uploads\//,
          'uploads/',
        ),
      );

      await fs.unlink(imagePath);
    } catch (deleteError) {
      console.error(
        'Failed to delete image after database error:',
        deleteError,
      );
    }

    throw error;
  }
};


export const getRecognitions = async (
  userId: string,
  search?: string,
) => {
  return prisma.recognition.findMany({
    where: {
      userId,
      ...(search?.trim()
        ? {
          name: {
            contains: search.trim(),
            mode: 'insensitive',
          },
        }
        : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};


export const getRecognitionById = async (
  id: string,
  userId: string,
) => {
  return prisma.recognition.findFirst({
    where: {
      id,
      userId,
    },
  });
};

export const deleteRecognition = async (
  id: string,
  userId: string,
) => {
  const recognition =
    await prisma.recognition.findFirst({
      where: {
        id,
        userId,
      },
    });

  if (!recognition) {
    return false;
  }

  await prisma.recognition.delete({
    where: {
      id: recognition.id,
    },
  });

  if (recognition.imageUrl) {
    const imagePath = path.resolve(
      recognition.imageUrl.replace(
        /^\/uploads\//,
        'uploads/',
      ),
    );

    try {
      await fs.unlink(imagePath);
    } catch (error) {
      console.error(
        'Failed to delete recognition image:',
        error,
      );
    }
  }

  return true;
};
