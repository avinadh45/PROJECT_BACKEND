import { Types } from "mongoose";

export interface IConcernPreferredSchedule {
    date: Date;
    slotId:string
}
export interface IConcernProof{
    imageUrl?:string;
    video?:string;
}
export interface IConcernProviderResponse {
    rejected:boolean;
    rejectReason?:string;
    responseAt:Date
}
export interface IConcernTimelineEntry{
    status:string;
    updatedBy:string;
    at:Date;
}

export interface IConcern{

    _id:Types.ObjectId;
    bookingId:Types.ObjectId;
    userId:Types.ObjectId;
    serviceCenterId:Types.ObjectId;
    issueTittle:string;
    description:string;
    proof?:IConcernProof[];
    status: "pending" | "approved" | "rejected" | "scheduled" | "resolved";
    providerResponse?:IConcernProviderResponse;
    resolutionBookingId?:Types.ObjectId;
    timeline:IConcernTimelineEntry[];
    createAt?:Date;
    updatedAt?:Date 
}