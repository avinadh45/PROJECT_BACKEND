export interface AttentionRowDTO { 

    count:number,
    oldestAt: string | null ;
}

export interface SubscriptionIssuesDTO  {

    expired: number;
    expiringSoon: number; 
}

export interface AdminAttentionDTO { 

    pendingVerifications: AttentionRowDTO;
    staleConcerns: AttentionRowDTO;
    subscriptionIssues: SubscriptionIssuesDTO;
    totalIssues: number;
}

export interface StatWithChangeDTO { 

    value:number;
    changePct: number  | null;
}

export interface AdminSummaryDTO {
    totalUsers: StatWithChangeDTO;
    totalGarages: StatWithChangeDTO;
    totalBookings: StatWithChangeDTO;
    platformRevenue: StatWithChangeDTO;
    approvedGarages: number;
    activeGarages: number;
    subscribedGarages: number;
    pendingApprovals: number;
}

export interface AdminTrendsDTO{ 

    labels: string[];
    bookings:number[];
    revenue: number[];
}

export interface RecentApplicationDTO {
    id: string;
    name: string;
    ownerName: string;
    city: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
}

export interface AdminVerificationDTO {

    counts:{ pending: number; approved: number; rejected: number};
    recent:RecentApplicationDTO[]
}