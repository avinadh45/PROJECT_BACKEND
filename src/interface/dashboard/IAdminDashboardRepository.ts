import { AttentionRow, SubscriptionIssuesRow } from "./IAdminDashboard";
import { PeriodTotalsRaw,GarageHealthRaw,TrendBucket,VerificationCountsRaw,RecentApplicationRaw } from "./IAdminDashboard";

export interface IAdminDashboardRepository {

    getPendingVerification(): Promise<AttentionRow>
    getStaleConcerns(cutoff:Date):Promise<AttentionRow>
    getSubscriptionIssues(now:Date,soonLimit:Date): Promise<SubscriptionIssuesRow>
     getUserCounts(monthStart: Date, lastMonthStart: Date): Promise<PeriodTotalsRaw>
    getGarageCounts(monthStart: Date, lastMonthStart: Date): Promise<PeriodTotalsRaw>
    getBookingCounts(monthStart: Date, lastMonthStart: Date): Promise<PeriodTotalsRaw>
    getRevenueTotals(monthStart: Date, lastMonthStart: Date): Promise<PeriodTotalsRaw>
    getGarageHealth(now: Date):Promise<GarageHealthRaw>
    
    getBookingTrend(start: Date, format: string): Promise<TrendBucket[]>
    getRevenueTrend(start: Date, format: string): Promise<TrendBucket[]>

    getVerificationCounts(): Promise<VerificationCountsRaw>
    getRecentApplications(limit: number): Promise<RecentApplicationRaw[]>
}