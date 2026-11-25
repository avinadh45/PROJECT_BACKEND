export type TrendRange = "week" | "month"; 


export interface TodayBookingDTO { 

    id:string;
    status:string;
    visitType:string;
    startTime:string;
    endTime:string;
    customerName?:string;
    vehicle:string;
    registrationNumber?:string ;
    serviceName?:string ;
}

export  interface TopServiceDTO { 

    categoryId:string;
    name:string;
    icon?:string;
    count:number;
}

export interface DashboardSummaryDTO { 

    todayCount:number;
    openJobs:number;
    earnings:{
        thisMonth:number;
        pendingPayout: number;
        pendingInvoices:number;
    }
    rating: {
        average?:number;
        count:number;
    };
    statusBreakdown :{ status:string;count:number }[];
    topServices:TopServiceDTO[];
    actions: {
        refundsDue: number;
        awaitingInvoice:number;
        pendingConcerns: number;
    }
}

export interface    DashboardTrendDTO { 

    range:TrendRange;
    granularity: "day" | "month";
    points: { key: string; bookings: number; earnings: number }[];

}