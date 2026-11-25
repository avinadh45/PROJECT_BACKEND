import { ZodType } from "zod";
import { AppError } from "../utils/AppError";
import { HttpStatus } from "../enums/httpstatus";
import { Request, Response,NextFunction  } from "express";

export const validate = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(result.error.issues[0].message, HttpStatus.BAD_REQUEST));
  }
  req.body = result.data;
  next();
};
