import { Types } from 'mongoose'
import { IBooking } from './IBookking'
import { PaginatedResponse } from '../common/pagination'

export interface IBookkingReadRepository{ 

    findByRazorpayOrderId(orderId:string):Promise<(IBooking & { save:()=> Promise<any>}) | null>
    getAdvanceFeeForService(serviceCenterId:string,categoryId:string):Promise<number | null>
    findById(bookingId:string):Promise<IBooking | null>
    findByServiceCenter(serviceCenterId:string,page:number,limit:number,status?:string,search?:string):Promise<PaginatedResponse<any>>
    findByMechanic(mechanicId:string,page:number,limit:number,status?:string,search?:string):Promise<PaginatedResponse<any>>
}

export interface IBookingWriteRepository{

    create(data:Partial<IBooking>):Promise<IBooking & {save: ()=> Promise<any>}>
}

