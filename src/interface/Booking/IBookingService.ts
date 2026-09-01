import { BookingConfirmationDTO, BookingOrderDTO, BookingOrderResultDTO, VerifyBookingPaymentDTO } from "../../dto/booking/BookingOrderDTO";
import { BookingSummaryDTO } from "../../dto/booking/BookingSummaryDTO";
import { GarageFilterDTO } from "../../dto/booking/GarageFilterDTO";
import { GarageSearchResultDTO } from "../../dto/booking/GarageResultDTO";
import { PaginatedResponse } from "../common/pagination";

export interface IBookingService {
    findAvailableGarages(dto:GarageFilterDTO):Promise<GarageSearchResultDTO[]>
    createBookingOrder(userId:string,dto:BookingOrderDTO):Promise<BookingOrderResultDTO>
    verifyBookingPayment(userId:string,dto:VerifyBookingPaymentDTO):Promise<BookingConfirmationDTO>
    getBooking(userId:string,bookingId:string):Promise<BookingConfirmationDTO>
    getServiceCenterBookings(serviceCenterId:string,page:number,limit:number,status?:string,search?:string):Promise<PaginatedResponse<BookingSummaryDTO>>
}