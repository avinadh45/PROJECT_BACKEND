import { BookingConfirmationDTO } from "../../dto/booking/BookingOrderDTO";
import { GarageSearchResultDTO } from "../../dto/booking/GarageResultDTO";
import { IBooking } from "../../interface/Booking/IBookking";

export class BookingMapper {
  static toSearchResultDTO(r: any): GarageSearchResultDTO {
    return {
      id: r._id.toString(),
      garageName: r.garageName,
      garageProfileImage: r.garageProfileImage,
      formattedAddress: r.formattedAddress,
      advanceFee: r.matchedService?.advanceFee ?? null,
      distanceInKm: r.distanceInMeters
        ? Math.round((r.distanceInMeters / 1000) * 10) / 10
        : undefined,
    };
  }
  static toConfirmationDTO(booking:IBooking):BookingConfirmationDTO{
    return{
      id:booking._id.toString(),
      status:booking.status,
      mechanicAssigned:!! booking.mechanicId,
      serviceCenterId:booking.serviceCenterId.toString(),
      vehicleId:booking.vehicleId.toString(),
      categoryId:booking.categoryId.toString(),
      visitType:booking.visitType,
      schedule:booking.schedule,
      advancePayment:{
        amount:booking.advancePayment.amount,
        status:booking.advancePayment.status,
        paidAt:booking.advancePayment.paidAt
      }
    }
  }
}
