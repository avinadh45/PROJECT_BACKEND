import { Types } from 'mongoose'
import { IBooking, IJobDescriptionItem } from './IBookking'
import { PaginatedResponse } from '../common/pagination'

export interface IBookkingReadRepository{ 

    findByRazorpayOrderId(orderId:string):Promise<(IBooking & { save:()=> Promise<any>}) | null>
    getAdvanceFeeForService(serviceCenterId:string,categoryId:string):Promise<number | null>
    findById(bookingId:string):Promise<IBooking | null>
    findByServiceCenter(serviceCenterId:string,page:number,limit:number,status?:string,search?:string):Promise<PaginatedResponse<any>>
    findByMechanic(mechanicId:string,page:number,limit:number,status?:string,search?:string):Promise<PaginatedResponse<any>>
    findMechanicBookingDetails(bookingId:string,mechanicId:string):Promise<any | null>
    findServiceCenterBookingDetails(bookingId:string,serviceCenterId:string):Promise<any | null>
}

export interface IBookingWriteRepository{

    create(data:Partial<IBooking>):Promise<IBooking & {save: ()=> Promise<any>}>
    updateJobItems(bookingId:string,mechanicId:string,items:IJobDescriptionItem[]):Promise<IBooking | null>
    updateStatus(bookingId:string,mechanicId:string,status:string,updateBy:string):Promise<IBooking | null >
    uploadProof(bookingId:string,mechanicId:string,imageUrl:string):Promise< IBooking | null>
}

