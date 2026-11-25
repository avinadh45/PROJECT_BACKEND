import { DashboardSummaryDTO, DashboardTrendDTO, TodayBookingDTO } from "../../dto/dashboard/dashboardDTO";
import { IDashboardRepository } from "../../interface/dashboard/IDashboardRepository";
import { IDashboardService } from "../../interface/dashboard/IDashboardService";
import { DashboardMapper } from "../../mapper/dashboard/DashboardMapper";
import { todayKey, TZ_OFFSET } from "../../utils/dateKeys";
import { buildTrendWindow } from "../../utils/trendWindow";
import { TrendRange } from "../../dto/dashboard/dashboardDTO";


export class DashboardService implements IDashboardService { 

    constructor( private _repo : IDashboardRepository) {} 


    async getSummary(serviceCenterId: string): Promise<DashboardSummaryDTO> {
        
        const today = todayKey() 
        const monthStart = new Date(`${today.slice(0, 7)}-01T00:00:00${TZ_OFFSET}`);

        const [todayCount,statusCounts,topServices,earnings,actions,reviewStats] = await Promise.all([ 
            this._repo.countTodaysBookings(serviceCenterId,today),
            this._repo.getStatusCounts(serviceCenterId),
            this._repo.getTopService(serviceCenterId,5),
            this._repo.getEarningsTotals(serviceCenterId,monthStart),
            this._repo.getActionCounts(serviceCenterId),
            this._repo.getReviewStats(serviceCenterId)
        ])
        return DashboardMapper.toSummary({ todayCount,statusCounts,topServices,earnings,actions,reviewStats})
    }

    async  getTrends(serviceCenterId: string, range: TrendRange): Promise<DashboardTrendDTO> {
        
        const w = buildTrendWindow(range) 

        const [ bookingRows, earningRows] = await Promise.all([
            this._repo.getBookingTrend( serviceCenterId, w.fromKey, w.toKey, w.keyLength),
            this._repo.getEarningsTrend( serviceCenterId, w.fromDate, w.toDate, w.format)
        ])

        return DashboardMapper.toTrend( range, w.granularity, w.keys, bookingRows, earningRows)
    }

    async getToday(serviceCenterId: string): Promise<TodayBookingDTO[]> {
        
        const rows = await this._repo.findTodaysBookings(serviceCenterId,todayKey())
        return rows.map((row)=> DashboardMapper.toTodayBooking(row))
    }

}
