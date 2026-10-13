
import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 50 characters',
      'any.required': 'Name is required',
    }),

  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Invalid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 128 characters',
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required(),

  password: Joi.string()
    .required(),
});

export const updateUserSchema = Joi.object({
  field: Joi.string()
    .valid('name', 'password')
    .required(),

  value: Joi.when('field', {
    is: 'name',
    then: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required(),

    otherwise: Joi.string()
      .min(6)
      .max(128)
      .required(),
  }),
});
