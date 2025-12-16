import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation middleware factory for Zod schemas
 * Validates request body, query, or params against a Zod schema
 */
export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = req[source];
      const validated = schema.parse(data);
      req[source] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: formattedErrors,
        });
        return;
      }

      next(error);
    }
  };
};

/**
 * Validate multiple sources at once
 */
export const validateRequest = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const errors: Array<{ field: string; message: string; source: string }> = [];

      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          result.error.errors.forEach((err) => {
            errors.push({
              field: err.path.join('.'),
              message: err.message,
              source: 'body',
            });
          });
        } else {
          req.body = result.data;
        }
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          result.error.errors.forEach((err) => {
            errors.push({
              field: err.path.join('.'),
              message: err.message,
              source: 'query',
            });
          });
        } else {
          req.query = result.data;
        }
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          result.error.errors.forEach((err) => {
            errors.push({
              field: err.path.join('.'),
              message: err.message,
              source: 'params',
            });
          });
        } else {
          req.params = result.data;
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: errors,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
