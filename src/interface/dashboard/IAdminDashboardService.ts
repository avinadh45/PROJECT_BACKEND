import { AdminAttentionDTO, AdminSummaryDTO, AdminTrendsDTO, AdminVerificationDTO } from "../../dto/dashboard/AdminDashboardDTO";
import { TrendRange } from "../../utils/adminDateRange";
import { AdminSummaryRaw, GarageHealthRaw, PeriodTotalsRaw, RecentApplicationRaw, TrendBucket, VerificationCountsRaw } from "./IAdminDashboard";

export interface IAdminDashboardService {

    getAttention(): Promise<AdminAttentionDTO>
    getSummary():Promise<AdminSummaryDTO>
    getTrends(range:TrendRange):Promise<AdminTrendsDTO>
    getVerification():Promise<AdminVerificationDTO>
   
}