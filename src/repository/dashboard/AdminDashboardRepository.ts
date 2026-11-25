import { Model } from "mongoose";
import Concern from "../../model/concernModel";
import ServiceCenter from "../../model/ServiceCenterModel";
import { IAdminDashboardRepository } from "../../interface/dashboard/IAdminDashboardRepository";
import { AttentionRow,GarageHealthRaw,PeriodTotalsRaw,RecentApplicationRaw,SubscriptionIssuesRow, TrendBucket, VerificationCountsRaw } from "../../interface/dashboard/IAdminDashboard";
import User from "../../model/Usermodel";
import Booking from "../../model/bookingModel";
import { COUNTED_BOOKING_STATUSES, DASHBOARD_TIMEZONE, OPERATING_GARAGE_FILTER } from "../../constants/dashboard";
import InvoiceModel from "../../model/invoiceModel";

export class AdminDashboardRepository implements IAdminDashboardRepository { 


    private async countWithOldest( 
        model: Model<any>,
        match: Record<string,unknown>,
        dateField: string
    ):Promise<AttentionRow>{
        const [row] = await model.aggregate([
            { $match: match},
            { $group:{
                _id:null,
                count: { $sum: 1},
                oldestAt: { $min: `$${dateField}` }
            }}
        ]);
        return { count:row?.count ?? 0, oldestAt: row?.oldestAt ?? null}
    }

    private async periodCounts( 
        model:Model<any>,
        filter:Record<string,unknown>,
        monthStart:Date,
        lastMonthStart:Date
    ):Promise<PeriodTotalsRaw>{ 
        
        const [ total, thisMonth, lastMonth ] = await Promise.all([
            model.countDocuments(filter),
            model.countDocuments({...filter,createdAt: { $gte:monthStart}}),
            model.countDocuments({...filter,createdAt:{ $gte:lastMonthStart,$lt:monthStart}})
        ])
        return { total, thisMonth,lastMonth}
    }

    async getPendingVerification(): Promise<AttentionRow> {
        
        return this.countWithOldest(
            ServiceCenter,
            { verificationStatus: "pending" },
            "createdAt"
        )
    }

    async getStaleConcerns(cutoff: Date): Promise<AttentionRow> {
        return this.countWithOldest(
            Concern,
            { status: "pending", createdAt: { $lt: cutoff} },
            "createdAt"
        )
    }

    async getSubscriptionIssues(now: Date, soonLimit: Date): Promise<SubscriptionIssuesRow> {
        
        const base = { verificationStatus:"approved" , isBlocked:false} as const; 

        const [ expired, expiringSoon ] = await Promise.all([

            ServiceCenter.countDocuments({

                ...base,
                "subscription.endDate": { $lt: now}
            }),
            ServiceCenter.countDocuments({
                ...base,
                "subscription.endDate": { $gte: now, $lte: soonLimit}
            })
        ])
        return { expired,expiringSoon}
    }

    getUserCounts(monthStart: Date, lastMonthStart:Date):Promise<PeriodTotalsRaw> { 

        return this.periodCounts(User,{},monthStart,lastMonthStart)
    }

    getGarageCounts(monthStart: Date, lastMonthStart: Date): Promise<PeriodTotalsRaw> {
        
        return this.periodCounts(ServiceCenter,{},monthStart,lastMonthStart)
    }

    getBookingCounts(monthStart: Date, lastMonthStart: Date): Promise<PeriodTotalsRaw> {
        
        return this.periodCounts(Booking,{status:{ $in:COUNTED_BOOKING_STATUSES},originalBookingId:null},monthStart,lastMonthStart)
    }

    async getRevenueTotals(monthStart: Date, lastMonthStart: Date): Promise<PeriodTotalsRaw> {
        
        const sumBetween  = async(from?:Date, to?:Date) : Promise<number> => {

            const range : Record<string,Date> = {};
            if(from) range.$gte = from 
            if( to ) range.$lt = to 

            const [ row ] = await InvoiceModel.aggregate([
                { $match : { paidAt: Object.keys(range).length ? range: { $ne:null}}}, 
                { $group: { _id:null, total: { $sum:"$platformFeeAmount"}}}
            ])
            return row?.total ?? 0
        }
        const [ total,thisMonth,lastMonth] = await Promise.all([
            sumBetween(),
            sumBetween(monthStart),
            sumBetween(lastMonthStart,monthStart)
        ])
        return { total, thisMonth, lastMonth}
    }

    async getGarageHealth(now: Date): Promise<GarageHealthRaw> {
        
        const [ approved,active,subscribed,pending] = await Promise.all([

            ServiceCenter.countDocuments({ verificationStatus:"approved"}),
            ServiceCenter.countDocuments(OPERATING_GARAGE_FILTER    ),
            ServiceCenter.countDocuments({
                ...OPERATING_GARAGE_FILTER,
                "subscription.endDate": { $gte:now}
            }),
            ServiceCenter.countDocuments({ verificationStatus:"pending"})
        ])
        return  { approved, active, subscribed, pending}
    }

    getBookingTrend(start: Date, format: string): Promise<TrendBucket[]> {
        
        return Booking.aggregate([{ 
            $match: { 
                createdAt: { $gte: start},
                status: { $in: COUNTED_BOOKING_STATUSES},
                originalBookingId: null,
            }
        },
        {
            $group:{
                _id:{
                    $dateToString:{format,date:"$createdAt",timezone:DASHBOARD_TIMEZONE}
                },
                value: { $sum:1 }
            }
        }
    ])
    }

    getRevenueTrend(start: Date, format: string): Promise<TrendBucket[]> {
        
        return InvoiceModel.aggregate([
            { $match:{paidAt:{ $gte:start}}},
            {
                $group:{
                    _id:{ $dateToString:{ format,date:"$paidAt", timezone:DASHBOARD_TIMEZONE}},
                    value:{ $sum:"$platformFeeAmount"}
                }
            }
        ])
    }
    async getVerificationCounts(): Promise<VerificationCountsRaw> {
        

        const group = await ServiceCenter.aggregate([
            {$group:{_id:"$verificationStatus",count:{ $sum:1}}},
        ])

        const counts : VerificationCountsRaw = { pending:0, approved:0, rejected:0};

        for(const a of group){
            if(a._id in counts) counts[a._id as keyof VerificationCountsRaw] = a.counts 
        }
        return counts
    }
getRecentApplications(limit: number): Promise<RecentApplicationRaw[]> {
    return ServiceCenter.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("name ownerName city verificationStatus createdAt")
        .lean<RecentApplicationRaw[]>()
        .exec();
}
}