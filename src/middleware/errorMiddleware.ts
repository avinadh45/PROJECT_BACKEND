import { Request,Response,NextFunction } from "express";
import { HttpStatus } from "../enums/httpstatus";
import { AppError } from "../utils/AppError";



export const errorMiddleware = ( 
    err:any,
    req:Request,
    res:Response,
    next:NextFunction,
)=>{
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success:false,
            message:err.message
        })
    }
    if(err.name === "Validation"){
        return res.status(HttpStatus.BAD_REQUEST).json({
            success:false,
            message:err.message
        })
    }
    if(err.name === "jsonWebToken"){
        return res.status(HttpStatus.UNAUTHORIZED).json({
            success:false,
            message:"Invalid Token"
        })
    }
    if(err.name === "CastError"){
        return res.status(HttpStatus.BAD_REQUEST).json({
            success:false,
            message:"Invalid ID"
        })
    }
    console.error(err);

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success:false,
        message:"Internal Server Error"
    })
    
}