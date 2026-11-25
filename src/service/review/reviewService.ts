import { AppError } from "../../utils/AppError";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { ReviewMapper } from "../../mapper/review/ReviewMapper";
import type { IReviewService } from "../../interface/Review/IReviewService";
import { IReviewReadRepository,IReviewWriteRepository } from "../../interface/Review/IReviewRepository";
import { IBookkingReadRepository } from "../../interface/Booking/IBookingRepository";
import { IServiceCenterRepository } from "../../interface/ServiceCenter/IServiceCenterRepository";
import { INotificationService } from "../../interface/Notification/INotificationService";
import { BookingReviewDTO, ReviewResponseDTO } from "../../dto/review/reviewDTO";
import { CreateReviewDTO } from "../../validation/reviewValidate";

export class ReviewService implements IReviewService {

    constructor( private _reviewRepo : IReviewReadRepository & IReviewWriteRepository ,
                 private _bookingReppo : IBookkingReadRepository ,
                 private _serviceCenterRepo : IServiceCenterRepository,
                 private _notificationService: INotificationService
    ){}

    async createReview(userId: string, bookingId: string, data: CreateReviewDTO): Promise<ReviewResponseDTO> {
        
        const booking = await this._bookingReppo.findById(bookingId) 
        if(!booking){
            throw new AppError(MESSAGES.BOOKING.NOT_FOUND,HttpStatus.NOT_FOUND)
        }
        if(booking.userId.toString() !== userId){
            throw new  AppError(MESSAGES.COMMON.UNAUTHORIZED,HttpStatus.UNAUTHORIZED)
        }
        if(booking.status  !== "completed") {
            throw new AppError(MESSAGES.REVIEW.NOT_COMPLETED,HttpStatus.BAD_REQUEST)
        }
        const bbookking = await this._reviewRepo.findByBookingId(bookingId)
        if(bbookking){
            throw new AppError(MESSAGES.REVIEW.ALREADY_REVIEWED,HttpStatus.BAD_REQUEST)
        }
        let review 
        try {
            review = await this._reviewRepo.create({  
                bookingId,
                userId,
                serviceCenterId : booking.serviceCenterId.toString(),
                rating: data.rating,
                comment: data.comment || undefined
            })
        } catch (err : any) {
            if(err?.code === 11000){
                throw new AppError(MESSAGES.REVIEW.ALREADY_REVIEWED,HttpStatus.BAD_REQUEST)
            }
            throw err
        }
        await this._serviceCenterRepo.adjustReviewStatus(booking.serviceCenterId.toString(), 1,data.rating)
        try {
            await this._notificationService.notify({
                recipientId: booking.serviceCenterId.toString(),
                recipientRole:"serviceCenter",
                type:"review",
                title:"New Review",
                message:`A customer rated your service ${data.rating}/5`, 
                referenceId: booking._id.toString(), 
                referenceType: "booking",
            })
        } catch (err) {
            console.error("review notification failed", err);
        }
        return ReviewMapper.toDTO(review,"you")
    }

    async getBookingReview(userId: string, bookingId: string): Promise<BookingReviewDTO> {
        
        const booking = await this._bookingReppo.findById(bookingId)
        if(!booking) throw new AppError(MESSAGES.BOOKING.NOT_FOUND,HttpStatus.NOT_FOUND)
            if(booking.userId.toString() !== userId){
                throw new AppError(MESSAGES.COMMON.UNAUTHORIZED,HttpStatus.UNAUTHORIZED)
            }
            const review = await this._reviewRepo.findByBookingId(bookingId)
            return {
                review: review ? ReviewMapper.toDTO(review, "You") : null,
                canReview: !review && booking.status === "completed"
            }

    }

    async getGarageReviews(serviceCenterId: string, page: number, limit: number): Promise<{ items: ReviewResponseDTO[]; total: number; }> {
        
        const { items,total } = await this._reviewRepo.findByServiceCenter(serviceCenterId,page,limit)

        return { items: items.map((a)=> ReviewMapper.toDTO(a)),total}
    }
    
    async updateReview(userId: string, bookingId: string, data: CreateReviewDTO): Promise<ReviewResponseDTO> {
        
        const result = await this._reviewRepo.update(bookingId,userId, { rating: data.rating, comment: data.comment || undefined}) 

        if(!result) { 
            throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
        }

        const { previous, current} = result 
        const delta = data.rating - previous.rating 
        if(delta !==0 ){
            await this._serviceCenterRepo.adjustReviewStatus(previous.serviceCenterId.toString(),0,delta)
        }
        return ReviewMapper.toDTO(current,"You")
    }

    async deleteReview(userId: string, bookingId: string): Promise<void> {
        
        const deleted = await this._reviewRepo.delete(bookingId,userId)
        if(!deleted) throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)

            await this._serviceCenterRepo.adjustReviewStatus(deleted.serviceCenterId.toString(),-1,-deleted.rating)
    }
}