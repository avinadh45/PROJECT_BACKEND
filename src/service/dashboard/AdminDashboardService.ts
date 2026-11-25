import { IAdminDashboardService } from "../../interface/dashboard/IAdminDashboardService";
import { IAdminDashboardRepository } from "../../interface/dashboard/IAdminDashboardRepository";
import { AdminAttentionDTO, AdminSummaryDTO, AdminTrendsDTO, AdminVerificationDTO } from "../../dto/dashboard/AdminDashboardDTO";
import { AdminDashboardMapper } from "../../mapper/dashboard/AdminDashboardMapper";
import { buildTrendWindow, fillBuckets, getMonthBoundaries, TrendRange } from "../../utils/adminDateRange";

const STALE_CONCERN_DAYS = 7;
const EXPIRING_SOON_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000; 


export class AdminDashboard implements IAdminDashboardService { 

     constructor(private readonly _adminDashboardRepository: IAdminDashboardRepository) {} 

     async getAttention(): Promise<AdminAttentionDTO> {
         
        const now = new Date()
        const staleCutoff = new Date(now.getTime() - STALE_CONCERN_DAYS*DAY_MS)
        const soonLimit = new Date( now.getTime() + EXPIRING_SOON_DAYS * DAY_MS)

        const [ pendingVerifications, staleConcerns, subscriptionIssues] = await Promise.all([

         this._adminDashboardRepository.getPendingVerification(),
         this._adminDashboardRepository.getStaleConcerns(staleCutoff),
         this._adminDashboardRepository.getSubscriptionIssues(now,soonLimit)
        ])
        return AdminDashboardMapper.toAttentionDTO({

         pendingVerifications,
         staleConcerns,
         subscriptionIssues,
        })
     }

     async getSummary(): Promise<AdminSummaryDTO> {
        
      const now = new Date()
      const { monthStart, lastMonthStart } = getMonthBoundaries(now)

      const [ users,garages,bookings,revenue,garageHealth] = await Promise.all([

         this._adminDashboardRepository.getUserCounts(monthStart,lastMonthStart),
         this._adminDashboardRepository.getGarageCounts(monthStart,lastMonthStart),
         this._adminDashboardRepository.getBookingCounts(monthStart,lastMonthStart),
         this._adminDashboardRepository.getRevenueTotals(monthStart,lastMonthStart),
         this._adminDashboardRepository.getGarageHealth(now)
      ])

      return AdminDashboardMapper.toSummaryDTO({ users, garages, bookings, revenue, garageHealth})
     }

     async getTrends(range: TrendRange): Promise<AdminTrendsDTO> {
        
      const window = buildTrendWindow( range )

      const [ bookingBuckets, revenueBuckets ] = await Promise.all([

         this._adminDashboardRepository.getBookingTrend(window.start, window.format),
         this._adminDashboardRepository.getRevenueTrend(window.start, window.format)
      ])
      return AdminDashboardMapper.toTrendsDTO({
         labels:window.labels,
         bookings: fillBuckets(window.keys, bookingBuckets),
         revenue: fillBuckets(window.keys, revenueBuckets)
      })
     }

     async getVerification(): Promise<AdminVerificationDTO> {
        
          const [counts, recent] = await Promise.all([

            this._adminDashboardRepository.getVerificationCounts(),
            this._adminDashboardRepository.getRecentApplications(5)
          ])
          return AdminDashboardMapper.toVerificationDTO({ counts,recent})
     }
}