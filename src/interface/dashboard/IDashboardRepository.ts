import { TodayBookingDTO } from "../../dto/dashboard/dashboardDTO"
import { ActionCounts, EarningsTotal, ReviewStats, StatusCounts, TodayBookingRow, TopServiceRow, TrendCountRow, TrendEarningRow } from "./IDashboard"

export interface IDashboardRepository { 

    countTodaysBookings (serviceCenterId:string,dateKey:string):Promise <number>
    findTodaysBookings( serviceCenterId:string,dateKey:string):Promise<TodayBookingRow[]>
    getStatusCounts(serviceCenterId:string):Promise<StatusCounts>
    getTopService( serviceCenterId:string,limit:number):Promise<TopServiceRow[]>
    getBookingTrend( serviceCenterId:string, formKey:string, toKey:string, keyLength: 7 | 10,):Promise<TrendCountRow[]>
    getEarningsTrend( serviceCenterId:string,form:Date,toExclusive:Date,format:"%Y-%m-%d" | "%Y-%m"):Promise<TrendEarningRow[]>
    getEarningsTotals(serviceCenterId:string,monthStart:Date):Promise<EarningsTotal>
    getActionCounts(serviceCenterId:string):Promise<ActionCounts>
    getReviewStats(serviceCenterId:string):Promise<ReviewStats>
    
}