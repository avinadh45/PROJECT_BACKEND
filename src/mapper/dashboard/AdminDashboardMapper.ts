import { AdminAttentionRaw,AdminSummaryRaw,AdminTrendsRaw,AdminVerificationRaw,AttentionRow, PeriodTotalsRaw } from "../../interface/dashboard/IAdminDashboard";
import { AdminAttentionDTO, AdminSummaryDTO, AdminTrendsDTO, AdminVerificationDTO, AttentionRowDTO, StatWithChangeDTO } from "../../dto/dashboard/AdminDashboardDTO";
import { percentChange } from "../../utils/adminDateRange";

export class AdminDashboardMapper { 

    private static toRow( row: AttentionRow):AttentionRowDTO { 
        return { 
            count : row.count,
            oldestAt: row.oldestAt ? row.oldestAt.toISOString() : null 
        }
    }

static toAttentionDTO(raw: AdminAttentionRaw): AdminAttentionDTO {
  const { pendingVerifications, staleConcerns, subscriptionIssues } = raw;

  return {
    pendingVerifications: this.toRow(pendingVerifications),
    staleConcerns: this.toRow(staleConcerns),
    subscriptionIssues: {
      expired: subscriptionIssues.expired,
      expiringSoon: subscriptionIssues.expiringSoon,
    },
    totalIssues:
      pendingVerifications.count +
      staleConcerns.count +
      subscriptionIssues.expired +
      subscriptionIssues.expiringSoon,
  };
}

private static toStat(a:PeriodTotalsRaw):StatWithChangeDTO { 
   
  return { value:a.total,changePct:percentChange(a.thisMonth,a.lastMonth)}
}

  static toSummaryDTO(raw: AdminSummaryRaw): AdminSummaryDTO {
    return {
        totalUsers: this.toStat(raw.users),
        totalGarages: this.toStat(raw.garages),
        totalBookings: this.toStat(raw.bookings),
        platformRevenue: this.toStat(raw.revenue),
        approvedGarages: raw.garageHealth.approved,
        activeGarages: raw.garageHealth.active,
        subscribedGarages: raw.garageHealth.subscribed,
        pendingApprovals: raw.garageHealth.pending,
    };
}

  static toTrendsDTO(raw:AdminTrendsRaw): AdminTrendsDTO { 

    return {
      labels: raw.labels,
      bookings: raw.bookings,
      revenue: raw.revenue
    }
  }

  static toVerificationDTO(raw:AdminVerificationRaw):AdminVerificationDTO  { 

    return {

      counts:raw.counts,
       recent: raw.recent.map((row) => ({
                id: row._id.toString(),
                name: row.name,
                ownerName: row.ownerName,
                city: row.city,
                status: row.verificationStatus,
                createdAt: row.createdAt.toISOString(),
            })),
    }
  }
  
}