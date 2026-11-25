

import { Request, Response, NextFunction } from "express"
import { HttpStatus } from "../enums/httpstatus"
import jwt from "jsonwebtoken"
import User from "../model/Usermodel"


interface JwtUserPayload {
  id: string;
  role: "user" | "mechanic" | "admin" | "serviceCenter";
}

export const authMiddleware = async(
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

    const account = await User.findById(decoded.id).select("isBlocked").lean()

    if(!account){
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success:false,
        message:"Invalid or expired token"
      })
    }

    if(account.isBlocked){

      res.clearCookie("accessToken")
      res.clearCookie("refreshToken");
      return res.status(HttpStatus.FORBIDDEN).json({
        success:false,
        code: "USER_BLOCKED",
        message:"your are blocked"
      })
    }

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
