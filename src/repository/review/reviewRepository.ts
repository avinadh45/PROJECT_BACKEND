import { Types } from "mongoose";
import { Review } from "../../model/reviewModel";
import { ICreateReview, IUpdateReview, ReviewUpdateResult } from "../../interface/Review/IReview";
import { ReviewRecord } from "../../interface/Review/IReview";
import { ReviewWithUser } from "../../interface/Review/IReview";

import { IReviewReadRepository,IReviewWriteRepository } from "../../interface/Review/IReviewRepository";



export class ReviewRepository implements IReviewReadRepository, IReviewWriteRepository { 

    async findByBookingId(bookingId: string): Promise<ReviewRecord | null> {
        return Review.findOne({
            bookingId: new Types.ObjectId(bookingId)
        }).lean() as unknown as Promise <ReviewRecord | null >
    }
    async findByServiceCenter(serviceCenterId: string, page: number, limit: number): Promise<{ items: ReviewWithUser[]; total: number; }> {
        
        const match = { serviceCenterId: new Types.ObjectId(serviceCenterId)} 

        const [ items,total] = await Promise.all([
            Review.aggregate<ReviewWithUser>([
                {$match:match},
                {$sort: {createdAt:-1}},
                {$skip:(page - 1)*limit},
                {$limit:limit},
                { $lookup:{
                    from:"users",
                        localField:"userId", 
                        foreignField:"_id",
                        as:"user"
                }},
                { $unwind:{path:"$user" , preserveNullAndEmptyArrays:true}},
                { $project: {rating:1, comment: 1, createdAt:1 ,userName:"$user.name"}}
            ]),
            Review.countDocuments(match)
        ])
        return { items,total}
    }

    async create(data: ICreateReview): Promise<ReviewRecord> {
        
        const doc = await Review.create({ 
            bookingId: new Types.ObjectId(data.bookingId),
            userId: new Types.ObjectId(data.userId),
            serviceCenterId: new Types.ObjectId(data.serviceCenterId),
            rating: data.rating,
            comment: data.comment
        })
        return doc.toObject() as unknown as ReviewRecord
    }

 async update(bookingId: string, userId: string, data: IUpdateReview): Promise<ReviewUpdateResult | null> {
     
    const update = data.comment?{ $set :{rating: data.rating, comment: data.comment}} : 
    { $set : { rating: data.rating}, $unset:{ comment:1}} ;  

    const previous = ( await Review.findOneAndUpdate({ bookingId : new Types.ObjectId(bookingId), userId: new Types.ObjectId(userId)},
    update, 
    { returnDocument:"before", runValidators:true},
).lean()) as unknown as ReviewRecord | null 

if(!previous) return null 

return { previous,current:{ ...previous,rating : data.rating, comment: data.comment,}}
 }

 async delete(bookingId: string, userId: string): Promise<ReviewRecord | null> {
     
    return Review.findOneAndDelete({ bookingId: new Types.ObjectId(bookingId), userId: new Types.ObjectId(userId)}).lean() as unknown as Promise< ReviewRecord | null >
 }
}