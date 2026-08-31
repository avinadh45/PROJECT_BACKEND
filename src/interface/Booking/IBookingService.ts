import { BookingConfirmationDTO, BookingOrderDTO, BookingOrderResultDTO, VerifyBookingPaymentDTO } from "../../dto/booking/BookingOrderDTO";
import { GarageFilterDTO } from "../../dto/booking/GarageFilterDTO";
import { GarageSearchResultDTO } from "../../dto/booking/GarageResultDTO";

export interface IBookingService {
    findAvailableGarages(dto:GarageFilterDTO):Promise<GarageSearchResultDTO[]>
    createBookingOrder(userId:string,dto:BookingOrderDTO):Promise<BookingOrderResultDTO>
    verifyBookingPayment(userId:string,dto:VerifyBookingPaymentDTO):Promise<BookingConfirmationDTO>
    getBooking(userId:string,bookingId:string):Promise<BookingConfirmationDTO>
}