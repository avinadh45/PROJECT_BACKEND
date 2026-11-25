import { TrendBucket } from "../../utils/adminDateRange";
import { Types } from "mongoose";

export interface AttentionRow { 

    count:number;
    oldestAt: Date | null;
}

export interface SubscriptionIssuesRow { 

    expired:number; 
    expiringSoon: number 
}

export interface AdminAttentionRaw {
  pendingVerifications: AttentionRow;
  staleConcerns: AttentionRow;
  subscriptionIssues: SubscriptionIssuesRow;
} 



export interface PeriodTotalsRaw {
  total: number;
  thisMonth: number;
  lastMonth: number;
}

export interface GarageHealthRaw {
  approved: number;
  active: number;
  subscribed: number;
  pending: number;
}

export interface AdminSummaryRaw {
  users: PeriodTotalsRaw;
  garages: PeriodTotalsRaw;
  bookings: PeriodTotalsRaw;
  revenue: PeriodTotalsRaw;
  garageHealth: GarageHealthRaw;
}

export interface AdminTrendsRaw {
  labels: string[];
  bookings: number[];
  revenue: number[];
}

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface VerificationCountsRaw {
  pending: number;
  approved: number;
  rejected: number;
}

export interface RecentApplicationRaw {

    _id: Types.ObjectId;
    name:string;
    ownerName:string;
    city:string;
    verificationStatus: VerificationStatus;
     createdAt: Date;
}

export interface AdminVerificationRaw { 

    counts: VerificationCountsRaw;
    recent: RecentApplicationRaw[];
}

export type { TrendBucket }