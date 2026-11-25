import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { IReviewService } from "../../interface/Review/IReviewService";
import { sendSuccess } from "../../utils/apiResponse";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";

export class ReviewController { 

    constructor( private _service: IReviewService) {} 

  createReview = asyncHandler(async(req:Request,res:Response)=>{

    const userId = (req as any).user.id; 
    const { bookingId } = req.params; 
    const result = await this._service.createReview( userId, bookingId as string, req.body);
    return sendSuccess(res,result, MESSAGES.REVIEW.CREATED,HttpStatus.CREATED)
  })

  getBookingReview = asyncHandler(async(req:Request,res:Response)=>{

    const userId = ( req as any).user.id 
    const { bookingId } = req.params; 
    const result = await this._service.getBookingReview(userId,bookingId as string)
    return sendSuccess(res,result,MESSAGES.REVIEW.REVIEW_FETCHED,HttpStatus.OK)
  })

  getGarageReview = asyncHandler(async(req:Request,res:Response)=>{

    const { serviceCenterId } = req.params
    const page = Math.max(Number(req.query.page) || 1,1)
    const limit = Math.min(Number(req.query.limit) || 5,20);
    const result = await this._service.getGarageReviews( serviceCenterId as string,page,limit)
    return sendSuccess(res,result,MESSAGES.REVIEW.REVIEW_FETCHED,HttpStatus.OK)
  })

  updateReview = asyncHandler(async(req:Request,res:Response)=>{ 

    const userId = ( req as any).user.id 
    const { bookingId } = req.params 
    const result = await this._service.updateReview(userId,bookingId as string, req.body)
    return sendSuccess(res,result,MESSAGES.REVIEW.REVIEW_UPDATED,HttpStatus.OK)
  })

  deleteReview = asyncHandler(async(req:Request,res:Response)=>{

     const userId = ( req as any).user.id  
     const { bookingId } = req.params 
     await this._service.deleteReview(userId,bookingId as string)
     return sendSuccess(res,null,MESSAGES.REVIEW.DELETED,HttpStatus.OK)
  })
}