
import { Types } from "mongoose";
import Booking from "../../model/bookingModel";
import InvoiceModel from "../../model/invoiceModel";
import Concern from "../../model/concernModel";
import ServiceCenter from "../../model/ServiceCenterModel";
import { TZ } from "../../utils/dateKeys";
import type { IDashboardRepository } from "../../interface/dashboard/IDashboardRepository";
import type { ActionCounts,EarningsTotal,ReviewStats,StatusCounts,TodayBookingRow,TopServiceRow,TrendCountRow,TrendEarningRow } from "../../interface/dashboard/IDashboard";

const COUNTED_STATUSES = ["confirmed", "assigned", "in-progress", "completed"]; 

const oid = (id: string) => new Types.ObjectId(id); 


export class DashboardRepository implements IDashboardRepository { 

    countTodaysBookings(serviceCenterId: string, dateKey: string): Promise<number> {
        
        return Booking.countDocuments({
            serviceCenterId: oid(serviceCenterId),
            "schedule.date": dateKey,
            status: { $in:COUNTED_STATUSES}
        })
    }

    findTodaysBookings(serviceCenterId: string, dateKey: string): Promise<TodayBookingRow[]> {
        
        return Booking.aggregate<TodayBookingRow>([{
            $match:{
                serviceCenterId: oid(serviceCenterId),
                "schedule.date": dateKey,
                status:{ $in: COUNTED_STATUSES}
            }
        },
        { $sort:{ "schedule.slotStartingTime":1}},
        { $limit: 50 }, 
        { $lookup: {from:"users", localField:"userId",foreignField:"_id", as:"customer"}},
        { $lookup :{from:"vehicles",localField:"vehicleId", foreignField:"_id",as:"vehicle"}},
        { $lookup:{ from:"categories", localField:"categoryId", foreignField:"_id", as:"category"}},
        {
            $project:{
                status:1,
                visitType: 1,
                startTime:"$schedule.slotStartingTime",
                endTime:"$schedule.slotEndingTime", 
                customerName: { $arrayElemAt:["$customer.name",0]},
                vehicleBrand: { $arrayElemAt:["$vehicle.brand", 0]},
                vehicleModel: { $arrayElemAt: ["$vehicle.model", 0]},
                registrationNumber:{ $arrayElemAt:["$vehicle.RegistrationNumber", 0] },
                serviceName: { $arrayElemAt:["$category.name", 0]}
            }
        }
    ])
    }

    async getStatusCounts(serviceCenterId: string): Promise<StatusCounts> {
        
        const rows = await Booking.aggregate<{ _id:string,count:number}>([
            {$match :{ serviceCenterId:oid(serviceCenterId)}},
            { $group: {_id:"$status", count: {$sum:1}}}
        ])
        return Object.fromEntries(rows.map((r)=> [r._id,r.count]))
    }

    async getTopService(serviceCenterId: string, limit: number): Promise<TopServiceRow[]> {
        
        return Booking.aggregate<TopServiceRow>([{
            $match:{ serviceCenterId:oid(serviceCenterId),status:{ $in:COUNTED_STATUSES}}
        },
        { $group: { _id:"$categoryId" , count: { $sum:1}}},
        { $sort: {count: -1}},
        { $limit:limit},
         { $lookup: {from: "categories" , localField:"_id", foreignField:"_id", as:"category"}},
         { $unwind: "$category"},
         { $project : {name: "$category.name", icon: "$category.icon",count: 1}},
    ])
    }
    async getBookingTrend(serviceCenterId: string, formKey: string, toKey: string, keyLength: 7 | 10): Promise<TrendCountRow[]> {
        
        const row = await Booking.aggregate<{_id:string; count:number}>([{

            $match: {
                serviceCenterId: oid(serviceCenterId), 
                status: { $in:COUNTED_STATUSES},
                "schedule.date": {$gte: formKey, $lte: toKey},
            }
        },
        { $group: { _id:{ $substrCP:["$schedule.date", 0, keyLength]},count: { $sum:1} }}, 
    ])
      return row.map((r)=> ({key:r._id,count:r.count}))
    }

    async getEarningsTrend(serviceCenterId: string, form: Date, toExclusive: Date, format: "%Y-%m-%d" | "%Y-%m"): Promise<TrendEarningRow[]> {
        
        const data = await InvoiceModel.aggregate<{_id:string; total:number}>([{

            $match:{
                serviceCenterId: oid(serviceCenterId),
                paymentStatus: "paid",
                paidAt: { $gte: form, $lt: toExclusive},
            }
        },
        { 
            $group:{
                _id:{ $dateToString: {format, data:"$paidAt", timezone: TZ}},
                total:{ $sum: "$serviceCenterPayout"},
            }
        }
    ])
    return data.map((a)=> ({key: a._id, total:a.total}))
    }

     async getEarningsTotals(serviceCenterId: string, monthStart: Date): Promise<EarningsTotal> {
        
        const  [earned,pending] = await Promise.all([
            InvoiceModel.aggregate<{total:number}>([{ 

                $match:{
                    serviceCenterId: oid(serviceCenterId),
                    paymentStatus:"paid",
                    paidAt: { $gte: monthStart}
                },
            },
            { $group: {_id:null, total: {$sum: "$serviceCenterPayout"}}},
        ]),
        InvoiceModel.aggregate<{ total:number; count:number}>([
            { $match: { serviceCenterId: oid(serviceCenterId),paymentStatus:"pending"}},
            { $group: {_id:null, total: { $sum: "$serviceCenterPayout"}, count: { $sum:1}}}
        ])
        ])

        return { 

            earnedThisMonth: earned[0]?.total ?? 0,
            pendingPayout: pending[0]?.total ?? 0,
            pendingInvoices: pending[0]?.count ?? 0
        }
    }
    async getActionCounts(serviceCenterId: string): Promise<ActionCounts> {
        
        const id = oid(serviceCenterId) 

        const [ refundsDue,awaiting,pendingConcerns] = await Promise.all([

            Booking.countDocuments({ serviceCenterId:id, "advancePayment.status": "refund_due" }),
            Booking.aggregate<{ count:number }>([

                { $match:{ serviceCenterId: id, status:"completed", originalBookingId: null}}, 
                { $lookup: {from: "nvoices", localField:"_id", foreignField:"bookingId", as: "invoice"}},
                { $match: { invoice:{ $size: 0}}},
                { $count:"count"}
            ]),
            Concern.countDocuments({serviceCenterId:id,status:"pending"})
        ])
        return { refundsDue, awaitingInvoice:awaiting[0]?.count ?? 0,pendingConcerns}
    }

     async getReviewStats(serviceCenterId: string): Promise<ReviewStats> {
    const doc = (await ServiceCenter.findById(serviceCenterId)
      .select("reviewStats")
      .lean()) as { reviewStats?: ReviewStats } | null;

    return doc?.reviewStats ?? { count: 0, total: 0 };
  }
}
