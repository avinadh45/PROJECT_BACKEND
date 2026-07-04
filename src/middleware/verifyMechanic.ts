import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../enums/httpstatus";
import { MESSAGES } from "../constants/message";

export const verifyMechanic = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.mechanicAccessToken;

    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message:MESSAGES.MECHANIC.NO_TOKEN});
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string; role: string };

    if (decoded.role !== "mechanic") {
      return res.status(HttpStatus.FORBIDDEN).json({ success: false, message:MESSAGES.MECHANIC.ACCESS_DENIED });
    }

    (req as any).mechanic = decoded;
    next();
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, message:MESSAGES.MECHANIC.INVALID });
  }
};
