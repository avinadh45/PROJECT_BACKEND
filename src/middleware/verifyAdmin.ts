import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../enums/httpstatus";
import { MESSAGES } from "../constants/message";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.adminAccessToken;

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: MESSAGES.ADMIN.UNAUTHROISED });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string; role: string };

    if (decoded.role !== "admin") {
      return res.status(HttpStatus.FORBIDDEN).json({ success: false, message: MESSAGES.ADMIN.ADMIN_ONLY });
    }

    (req as any).admin = decoded;
    next();
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message: "Invalid or expired token" });
  }
};