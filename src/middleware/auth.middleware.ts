import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return secret;
};

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });

      return;
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
      });

      return;
    }

    const decoded = jwt.verify(
      token,
      getJwtSecret(),
    ) as { id: string; };

    req.user = { id: decoded.id, };

    next();
  } catch (error) {
    console.error('Auth error:', error);

    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};