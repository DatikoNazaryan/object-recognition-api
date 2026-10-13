import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../lib/prisma.js';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return secret;
};

const createToken = (userId: string): string => {
  return jwt.sign(
    {
      id: userId,
    },
    getJwtSecret(),
    {
      expiresIn: '7d',
    },
  );
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10,
  );

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashedPassword,
    },
  });

  const token = createToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthResponse> => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = createToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  };
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const updateUserField = async (
  userId: string,
  field: 'name' | 'password',
  value: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (field === 'name') {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: value.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
  }

  const hashedPassword = await bcrypt.hash(
    value,
    10,
  );

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });
};

export const updateUserAvatar = async (
  userId: string,
  file: Express.Multer.File,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      avatar: true,
    },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const uploadDirectory = path.resolve(
    'uploads',
    'avatars',
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

  const avatarUrl = `/uploads/avatars/${filename}`;

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      avatar: avatarUrl,
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  });

  if (user.avatar) {
    const oldAvatarPath = path.resolve(
      user.avatar.replace(
        /^\/uploads\//,
        'uploads/',
      ),
    );

    try {
      await fs.unlink(oldAvatarPath);
    } catch (error) {
      console.error(
        'Failed to delete old avatar:',
        error,
      );
    }
  }

  return updatedUser;
};

export const deleteUser = async (
  userId: string,
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      avatar: true,
    },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  if (user.avatar) {
    const avatarPath = path.resolve(
      user.avatar.replace(
        /^\/uploads\//,
        'uploads/',
      ),
    );

    try {
      await fs.unlink(avatarPath);
    } catch (error) {
      console.error(
        'Failed to delete user avatar:',
        error,
      );
    }
  }
};