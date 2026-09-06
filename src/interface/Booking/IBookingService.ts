import { BookingDetailDTO } from "../../dto/booking/BookingDetailsDTO";
import { BookingConfirmationDTO, BookingOrderDTO, BookingOrderResultDTO, VerifyBookingPaymentDTO } from "../../dto/booking/BookingOrderDTO";
import { BookingServiceCenterDetailDTO } from "../../dto/booking/BookingServiceCenterDetailDTO";
import { BookingSummaryDTO } from "../../dto/booking/BookingSummaryDTO";
import { GarageFilterDTO } from "../../dto/booking/GarageFilterDTO";
import { GarageSearchResultDTO } from "../../dto/booking/GarageResultDTO";
import { PaginatedResponse } from "../common/pagination";
import { IJobDescriptionItem } from "./IBookking";

export interface IBookingService {
    findAvailableGarages(dto:GarageFilterDTO):Promise<GarageSearchResultDTO[]>
    createBookingOrder(userId:string,dto:BookingOrderDTO):Promise<BookingOrderResultDTO>
    verifyBookingPayment(userId:string,dto:VerifyBookingPaymentDTO):Promise<BookingConfirmationDTO>
    getBooking(userId:string,bookingId:string):Promise<BookingConfirmationDTO>
    getServiceCenterBookings(serviceCenterId:string,page:number,limit:number,status?:string,search?:string):Promise<PaginatedResponse<BookingSummaryDTO>>
    getMechanicBooking(mechanicId:string,page:number,limit:number,status?:string,search?:string):Promise<PaginatedResponse<BookingSummaryDTO>>
    getBookingInMechanci(mechanicId:string,bookingId:string):Promise<BookingDetailDTO>
    updateMechanicJobItems(mechanicId:string,bookingId:string,items:IJobDescriptionItem[]):Promise<BookingDetailDTO>
    updateStatus(bookingId:string,mechanicId:string,status:string):Promise<BookingDetailDTO>
    uploadProof(bookingId:string,mechanicId:string,imageUrl:string):Promise<BookingDetailDTO>
    getServiceCenterBookingDetails(bookingId:string,serviceCenterId:string):Promise<BookingServiceCenterDetailDTO>
}