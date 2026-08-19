import { Types } from "mongoose";

export interface ISlot{
    
    serviceCenterId: Types.ObjectId;
    date:string;
    time:string;
    MaxBooking:number;
    bookedCount:number
    status: "available" | "full" | "blocked"
}
