import { Types } from 'mongoose'
import { IBooking } from './IBookking'

export interface IBookkingReadRepository{ 

    findByRazorpayOrderId(orderId:string):Promise<(IBooking & { save:()=> Promise<any>}) | null>
    getAdvanceFeeForService(serviceCenterId:string,categoryId:string):Promise<number | null>
    findById(bookingId:string):Promise<IBooking | null>
}

export interface IBookingWriteRepository{

    create(data:Partial<IBooking>):Promise<IBooking & {save: ()=> Promise<any>}>
}

