import { Schema,model,Types } from "mongoose";
import { IReviewDocument } from "../interface/Review/IReview";

const reviewSchema = new Schema<IReviewDocument>({

    bookingId: { type:Schema.Types.ObjectId, ref:"Booking", required:true, unique: true},
    userId: { type: Schema.Types.ObjectId, ref:"User", required: true },
    serviceCenterId : { type: Schema.Types.ObjectId, ref:"ServiceCenter"},
    rating: { type : Number,required:true,min:1,max:5},
    comment: { type:String,trim: true, maxlength: 500}
},
{ timestamps: { createdAt: true, updatedAt: false}},
 
)
reviewSchema.index({ serviceCenterId:1,paymentStatus:1, createdAt: -1})

export const Review = model<IReviewDocument>("Review", reviewSchema)