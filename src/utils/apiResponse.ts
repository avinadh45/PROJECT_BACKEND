import { Response } from "express";

export interface ApiResponse<T = unknown>{

    success:boolean;
    message:string;
    data?: T;
}
export function sendSuccess<T>(res:Response,data:T,message = "Success",statusCode = 200){
    const response : ApiResponse<T> = {success:true,message,data}
    return res.status(statusCode).json(response)
}