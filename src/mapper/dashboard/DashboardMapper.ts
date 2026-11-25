import { DashboardSummaryDTO, DashboardTrendDTO, TodayBookingDTO, TopServiceDTO, TrendRange } from "../../dto/dashboard/dashboardDTO";
import type { SummarySource, TodayBookingRow, TopServiceRow, TrendCountRow, TrendEarningRow,ActionCounts } from "../../interface/dashboard/IDashboard";
import { averageRating } from "../../utils/averageRating";


const OPEN_STATUSES = ["confirmed", "assigned", "in-progress"];
const SHOWN_STATUSES = ["confirmed", "assigned", "in-progress", "completed", "cancelled"];


export class DashboardMapper { 

    static toTodayBooking( row:TodayBookingRow): TodayBookingDTO { 

        return { 

            id: row._id.toString(),
            status: row.status,
            visitType: row.visitType,
            startTime:row.startTime,
            endTime:row.endTime,
            customerName: row.customerName,
            vehicle: [ row.vehicleBrand, row.vehicleModel].filter(Boolean).join(" "),
            registrationNumber: row.registrationNumber,
            serviceName: row.serviceName
        }
    }
    static toTopService( row:TopServiceRow ):TopServiceDTO { 

        return { 
            categoryId: row._id.toString(),
            name:row.name,
            icon:row.icon,
            count:row.count
        }
    }

    static toTrend( range:TrendRange,granularity: "day" | "month",key:string[], bookingRows: TrendCountRow[], earningRows:TrendEarningRow[],):DashboardTrendDTO{ 

        const bookings = new Map(bookingRows.map((r)=> [r.key, r.count]))
        const earning = new Map(earningRows.map((r)=> [r.key,r.total]))

       return {
    range,
    granularity,
    points: key.map((key) => ({
      key,
      bookings: bookings.get(key) ?? 0,
      earnings: earning.get(key) ?? 0,
    })),
  };
    }
    static toSummary(src:SummarySource):DashboardSummaryDTO { 

        const count = ( status:string) => src.statusCounts[status] ?? 0 

        return { 

            todayCount: src.todayCount,
            openJobs: OPEN_STATUSES.reduce((sum,status)=> sum + count(status),0),
            earnings: {
                thisMonth: src.earnings.earnedThisMonth,
                pendingPayout:src.earnings.pendingPayout,
                pendingInvoices: src.earnings.pendingInvoices
            },
            rating: {
                average:averageRating(src.reviewStats),
                count: src.reviewStats.count
            },
            statusBreakdown: SHOWN_STATUSES.map((status)=> ({ status, count:count(status)})),
            topServices: src.topServices.map((row)=> DashboardMapper.toTopService(row)),
            actions: src.actions
        }
    }
}