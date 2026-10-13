import { Request, Response } from 'express';

import {
  deleteUser,
  getAllUsers,
  loginUser,
  registerUser,
  updateUserAvatar,
  updateUserField,
} from '../services/auth.service.js';

import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const register = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const result = await registerUser(
      name,
      email,
      password,
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      ...result,
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);

    if (
      error instanceof Error &&
      error.message === 'EMAIL_ALREADY_EXISTS'
    ) {
      res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });

      return;
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(
      email,
      password,
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'INVALID_CREDENTIALS'
    ) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });

      return;
    }

    console.error('Login error:', error);

    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

export const getUsers = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to get users',
    });
  }
};

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    const { field, value } = req.body;

    const user = await updateUserField(
      userId,
      field,
      value,
    );

    res.status(200).json({
      success: true,
      message: `${field} updated successfully`,
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'USER_NOT_FOUND'
    ) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    console.error('Update user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

export const updateAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Avatar image is required',
      });

      return;
    }

    const user = await updateUserAvatar(
      userId,
      req.file,
    );

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'USER_NOT_FOUND'
    ) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    console.error('Update avatar error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update avatar',
    });
  }
};

export const removeUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    await deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'USER_NOT_FOUND'
    ) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    console.error('Delete user error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};