import { Response } from 'express';

import { AuthenticatedRequest, } from '../middleware/auth.middleware.js';

import {
  createRecognition,
  deleteRecognition,
  getRecognitionById,
  getRecognitions,
} from '../services/recognition.service.js';

export const recognizeObject = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Image is required',
      });

      return;
    }

    const { name, confidence } = req.body;

    if (
      !name ||
      typeof name !== 'string' ||
      !name.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'Object name is required',
      });

      return;
    }

    const confidenceNumber = Number(confidence);

    if (
      confidence === undefined ||
      confidence === null ||
      Number.isNaN(confidenceNumber) ||
      confidenceNumber < 0
    ) {
      res.status(400).json({
        success: false,
        message:
          'Confidence must be a number between 0 and 100',
      });

      return;
    }

    const recognition = await createRecognition({
      userId: req.user.id,
      name: name.trim(),
      confidence: confidenceNumber,
      file: req.file,
    });

    res.status(201).json({
      success: true,
      recognition,
    });
  } catch (error) {
    console.error('========== CREATE RECOGNITION ERROR ==========');
    console.error('Error:', error);

    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }

    console.error('==============================================');

    res.status(500).json({
      success: false,
      message: error instanceof Error
        ? error.message
        : 'Object recognition failed',
    });
  }
};

export const getRecognitionHistory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const search =
      typeof req.query.search === 'string'
        ? req.query.search
        : '';

    const pageValue = req.query.page ?? '1';
    const limitValue = req.query.limit ?? '10';

    if (
      typeof pageValue !== 'string' ||
      typeof limitValue !== 'string' ||
      !/^[1-9]\d*$/.test(pageValue) ||
      !/^[1-9]\d*$/.test(limitValue)
    ) {
      res.status(400).json({
        success: false,
        message: 'Page and limit must be positive integers',
      });
      return;
    }

    const page = Number(pageValue);
    const limit = Number(limitValue);

    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      limit > 100
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid page or limit. Maximum limit is 100',
      });
      return;
    }

    const result = await getRecognitions(
      req.user.id,
      search,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      recognitions: result.recognitions,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    });
  } catch (error) {
    console.error('Get recognition history error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to get recognition history',
    });
  }
};

export const getRecognition = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    const { id } = req.params;

    if (typeof id !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid recognition id',
      });

      return;
    }

    const recognition = await getRecognitionById(
      id,
      req.user.id,
    );

    if (!recognition) {
      res.status(404).json({
        success: false,
        message: 'Recognition not found',
      });

      return;
    }

    res.status(200).json({
      success: true,
      recognition,
    });
  } catch (error) {
    console.error(
      'Get recognition error:',
      error,
    );

    res.status(500).json({
      success: false,
      message: 'Failed to get recognition',
    });
  }
};

export const removeRecognition = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    const { id } = req.params;

    if (typeof id !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Invalid recognition id',
      });

      return;
    }

    const deleted =
      await deleteRecognition(
        id,
        req.user.id,
      );

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Recognition not found',
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: 'Recognition deleted successfully',
    });
  } catch (error) {
    console.error(
      'Delete recognition error:',
      error,
    );

    res.status(500).json({
      success: false,
      message:
        'Failed to delete recognition',
    });
  }
};
