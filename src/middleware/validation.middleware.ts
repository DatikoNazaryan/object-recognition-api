
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      convert: true,
      stripUnknown: false,
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });

      return;
    }

    req.body = value;
    next();
  };
};
