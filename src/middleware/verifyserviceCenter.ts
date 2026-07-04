import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../enums/httpstatus";
import { MESSAGES } from "../constants/message";
export const verifyServiceCenter = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
// console.log(req.headers.authorization)
   try {
      const token = req.cookies.scAccessToken
      if(!token){
         return res.status(HttpStatus.UNAUTHORIZED).json({success:false,message:MESSAGES.COMMON.UNAUTHORIZED})
      }
      const decoded = jwt.verify(
         token,
         process.env.JWT_ACCESS_SECRET as string
      ) as {
         id: string;
         role: "serviceCenter";
      };
      if(decoded.role !== "serviceCenter"){
         return res.status(HttpStatus.FORBIDDEN).json({
            success:false,
            message:MESSAGES.SERVICE_CENTER.NO_ACCESS
         })
      }
      req.serviceCenter = {
         id: decoded.id,
         role: decoded.role
      };

      next();

   } catch (error) {

      return res.status(401).json({
         success: false,
         message: "Invalid token"
      });
   }
};