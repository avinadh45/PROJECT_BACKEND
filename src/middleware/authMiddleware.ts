

import { Request, Response, NextFunction } from "express"
import { HttpStatus } from "../enums/httpstatus"
import jwt from "jsonwebtoken"



interface JwtUserPayload {
  id: string;
  role: "user" | "mechanic" | "admin" | "serviceCenter";
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as JwtUserPayload;

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};