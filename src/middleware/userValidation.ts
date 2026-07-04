import { Request,Response,NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../enums/httpstatus";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};

        error.issues.forEach((err) => {
          const field = err.path[0] as string;

          formattedErrors[field] = err.message;
        });

        return res.status(400).json({
          success: false,
          errors: formattedErrors,
        });
      }

      next(error);
    }
  };
