import type { CreateReviewDTO } from "../../validation/reviewValidate";
import type { BookingReviewDTO, ReviewResponseDTO } from "../../dto/review/reviewDTO";

export interface IReviewService { 

    createReview( userId:string,bookingId:string,data:CreateReviewDTO):Promise< ReviewResponseDTO>
    getBookingReview( userId:string,bookingId:string): Promise< BookingReviewDTO>
    getGarageReviews( serviceCenterId: string, page:number,limit:number): Promise<{ items:ReviewResponseDTO[];total:number}> 
    updateReview( userId: string,bookingId:string, data:CreateReviewDTO):Promise< ReviewResponseDTO>
    deleteReview( userId:string,bookingId:string):Promise<void>
}
