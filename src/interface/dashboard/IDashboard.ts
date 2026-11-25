import type { Types } from "mongoose";

export interface TodayBookingRow { 

    _id:Types.ObjectId,
    status:string;
    visitType:string;
    startTime:string;
    endTime:string;
    customerName?: string;
    vehicleBrand?: string;
    vehicleModel?: string; 
    registrationNumber?: string;
    serviceName?: string;
}

export interface TopServiceRow { 

    _id:Types.ObjectId,
    name:string;
    icon?: string;
    count: number 
}

export interface TrendCountRow { 

    key:string;
    count:number
}

export interface TrendEarningRow {

    key:string;
    total:number
}

export type StatusCounts = Record<string,number> 


export interface EarningsTotal { 

    earnedThisMonth: number; 
    pendingPayout: number;
    pendingInvoices: number; 
}

export interface ActionCount { 

    refundDue:number;
    awaitingInvoice: number;
    pendingConcerns: number;
}

export interface ReviewStats{ 

    count:number;
    total:number 
}


export interface ActionCounts {
  refundsDue: number;
  awaitingInvoice: number;
  pendingConcerns: number;
}
export interface SummarySource { 

    todayCount: number;
    statusCounts: StatusCounts;
    topServices: TopServiceRow[];
    earnings: EarningsTotal;
    actions: ActionCounts;
    reviewStats:ReviewStats
}

