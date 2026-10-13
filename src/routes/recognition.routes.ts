import { Router } from 'express';

import {
  recognizeObject,
  getRecognitionHistory,
  getRecognition,
  removeRecognition,
} from '../controllers/recognition.controller.js';

import {
  authMiddleware,
} from '../middleware/auth.middleware.js';

import {
  upload,
} from '../middleware/upload.middleware.js';

const router = Router();

router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  recognizeObject,
);

router.get(
  '/',
  authMiddleware,
  getRecognitionHistory,
);

router.get(
  '/:id',
  authMiddleware,
  getRecognition,
);

router.delete(
  '/:id',
  authMiddleware,
  removeRecognition,
);

export default router;