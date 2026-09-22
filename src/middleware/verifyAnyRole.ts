import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken"
import { HttpStatus } from "../enums/httpstatus";
import { MESSAGES } from "../constants/message";
import { AppError } from "../utils/AppError";

interface JwtUserPayload {
  id: string;
  role: "user" | "mechanic" | "admin" | "serviceCenter";
}

const COOKIE_BY_ROLE: { role: "user" | "mechanic" | "serviceCenter"; cookieName: string; reqField: string }[] = [
  { role: "user", cookieName: "accessToken", reqField: "user" },
  { role: "mechanic", cookieName: "mechanicAccessToken", reqField: "mechanic" },
  { role: "serviceCenter", cookieName: "scAccessToken", reqField: "serviceCenter" },
];

export function verifyAnyRole(req:Request,res:Response,next:NextFunction){

    for(const { cookieName,reqField} of COOKIE_BY_ROLE){

        const token = req.cookies?.[cookieName]
        if(!token) continue;
        try {
            const decoded = jwt.verify(token,process.env.JWT_ACCESS_SECRET as string) as { id: string; role:string}
            (req as any)[reqField] = decoded 
            return next()
        } catch (error) {
            continue;
        }
    }
    return res.status(HttpStatus.UNAUTHORIZED).json({success:false,message:MESSAGES.COMMON.UNAUTHORIZED})
}
export function extractRequester(req: Request): { id: string; role: string } {
  const anyReq = req as any;
  if (anyReq.user) return { id: anyReq.user.id, role: "user" };
  if (anyReq.mechanic) return { id: anyReq.mechanic.id, role: "mechanic" };
  if (anyReq.serviceCenter) return { id: anyReq.serviceCenter.id, role: "serviceCenter" };
  throw new AppError(MESSAGES.COMMON.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
}