
import type { ICreateReview, IUpdateReview, ReviewRecord, ReviewUpdateResult, ReviewWithUser } from "./IReview";

export interface IReviewReadRepository {

    findByBookingId( bookingId:string) :Promise< ReviewRecord | null> 
    findByServiceCenter(serviceCenterId: string, page:number,limit:number):Promise<{ items:ReviewWithUser[];total:number}>
}

export interface IReviewWriteRepository {

    create(data:ICreateReview):Promise<ReviewRecord>
    update(bookingId: string, userId: string, data:IUpdateReview):Promise< ReviewUpdateResult | null >
    delete(bookingId:string, userId:string): Promise< ReviewRecord | null>
}
