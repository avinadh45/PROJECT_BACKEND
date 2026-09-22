import { PaginatedResponse } from "../common/pagination";
import { IConcern } from "./IConcern";

export interface IConcernReadRepository {

    findById(concernId:string):Promise<IConcern | null>
    findActiveByBooking(bookingId:string):Promise<IConcern | null>
    findByServiceCenter(serviceCenterId:string,page:number,limit:number,status?:string):Promise<PaginatedResponse<any>>
    findConcernDetails(concernId:string,serviceCenterId:string):Promise<any | null>
    findUserConcernDetail(concenId:string,userId:string):Promise<any | null>
    findActiveConcernByBookingIds(bookingIds:string[]):Promise<{bookingId:string;concernId:string}[]>
}
export interface IConcernWriteRepository{

    create(data:Partial<IConcern>):Promise<IConcern>
    respond(concernId:string,serviceCenterId:string,rejected:boolean,rejectReason?:string):Promise<IConcern | null>
    markSchedule(concernId:string,resolutionBookingId: string,updatedBy:string):Promise<IConcern | null>
}