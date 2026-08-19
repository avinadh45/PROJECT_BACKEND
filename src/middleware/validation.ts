import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { HttpStatus } from "../enums/httpstatus";

export const validate = (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }
    req.body = result.data; 
    next();
  };