import { Router } from 'express';
import {
  getUsers,
  login,
  register,
  removeUser,
  updateAvatar,
  updateUser,
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { avatarUpload } from '../middleware/avatar.upload.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
} from '../validations/auth.validation.js';

const router = Router();

router.post(
  '/register',
  validate(registerSchema),
  register,
);

router.post('/login', validate(loginSchema), login,);
router.get('/users', getUsers,);
router.post('/me', authMiddleware, validate(updateUserSchema), updateUser,);
router.post('/me/avatar', authMiddleware, avatarUpload.single('avatar'), updateAvatar,);
router.delete('/me', authMiddleware, removeUser,);

export default router;