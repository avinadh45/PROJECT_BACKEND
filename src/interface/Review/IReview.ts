import { Types } from "mongoose";

export interface IReviewDocument {

    bookingId: Types.ObjectId,
    userId:Types.ObjectId,
    serviceCenterId:Types.ObjectId,
    rating:number,
    comment?:string;
    createdAt?:Date
}

export interface ICreateReview {
  bookingId: string;
  userId: string;
  serviceCenterId: string;
  rating: number;
  comment?: string;
}

export type ReviewRecord = IReviewDocument & { _id: Types.ObjectId; createdAt: Date };

export type ReviewWithUser = {
  _id: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  userName?: string;
};

export interface IUpdateReview { 

  rating:number;
  comment?:string;
}

export type ReviewUpdateResult = { previous: ReviewRecord; current: ReviewRecord }