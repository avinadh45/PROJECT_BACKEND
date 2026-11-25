import { DashboardSummaryDTO, DashboardTrendDTO, TodayBookingDTO, TrendRange } from "../../dto/dashboard/dashboardDTO";

export interface IDashboardService { 

    getSummary(serviceCenterId:string): Promise<DashboardSummaryDTO>;
    getTrends( serviceCenterId:string,range:TrendRange): Promise<DashboardTrendDTO>
    getToday(serviceCenterId:string): Promise<TodayBookingDTO[]>
}