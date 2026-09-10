import { Types } from "mongoose"

export interface IPickupLocation { 

    type:"Point",
    coordinates:number[];
    formatedAddress:string;
}

export interface ISchedule{
     
    date:string;
    slotStartingTime:string;
    slotEndingTime:string;
}

export interface IStatusTimeline{

    status:string;
    updatedBy:string;
    at:Date ;
}
export interface IJobDescriptionItem{

    jobItemsId:string;
    issueFound:string;
    spareParts:string ;
    sparePartQty:number;
    estimatedTime:string;
    initalCost:number 
}

export interface IJob{
     
    reportedIssue:string;
    estimatedTime:string;
    estimatedCost:number;
    description:IJobDescriptionItem[]
}

export interface IProgressTask{

    taskName:string;
    status:string;
}

export interface IProof{

    imageUrl:string;
    uploadedBy:string;
    uploadedAt:string
}

export interface ILabourCharge{

    description:string;
    amount:number
}

export interface ISparePart{

    name:string;    
    qty:number;
    unitPrice:number;
    total:number
}

export interface IInvoiceSummary{

    labourTotal:number;
    partsTotal:number;
    platformFee:number ;
    advancepaid:number;
    grandTotal:number ;
}

export interface IInvoice{

    invoiceNumber:string;
    labourCharges:ILabourCharge[];
    spareParts:ISparePart[];
    summary:IInvoiceSummary
}

export interface IPaymentRecord{

    amount:number;
    status: "pending" | "paid" | "failed" | "refund_due" | "refunded";
    method?:string;
    paidAt:Date;
     razorpayOrderId?: string;
    razorpayPaymentId?: string;
    refundedAt?:Date
    refundedBy?: string
    refundId?: string;
}

export interface IBooking{

    _id:Types.ObjectId;
    userId:Types.ObjectId;
    serviceCenterId:Types.ObjectId;
    vehicleId:Types.ObjectId;
    categoryId:Types.ObjectId;
     mechanicId?: Types.ObjectId;
    visitType: "drive-in" | "pickup-drop";

    pickupLocation?: IPickupLocation;
    additionalInfo?: string;
    schedule:ISchedule;
    status:string;
    statusTimeline:IStatusTimeline[];
    job?:IJob;
    progressTasks?:IProgressTask[];
    proof?:IProof;
    invoice?:IInvoice;

    advancePayment:IPaymentRecord;
    finalPayment?:IPaymentRecord;

    createdAt?: Date;
    updatedAt?: Date 
}