import { BookingConfirmationDTO } from "../../dto/booking/BookingOrderDTO";
import { BookingSummaryDTO } from "../../dto/booking/BookingSummaryDTO";
import { GarageSearchResultDTO } from "../../dto/booking/GarageResultDTO";
import { IBooking } from "../../interface/Booking/IBookking";
import { BookingDetailDTO } from "../../dto/booking/BookingDetailsDTO";

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
  static toSummaryDTO(data:any):BookingSummaryDTO{
    return{
      id:data._id.toString(),
      customerName: data.customerName,
      vehicleRegistrationNumber:data.vehicleRegistrationNumber,
      categoryName:data.categoryName,
      visitType:data.visitType,
      schedule:data.schedule,
      mechanicName:data.mechanicName ?? null,
      status:data.status,
      advancePaymentStatus:data.advancePayment.status
    }
  }
  static toDetailDTO(raw: any): BookingDetailDTO {
  return {
    id: raw._id.toString(),
    status: raw.status,
    visitType: raw.visitType,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    vehicleRegistrationNumber: raw.vehicleRegistrationNumber,
    vehicleType: raw.vehicleType,
    vehicleBrand: raw.vehicleBrand,
    vehicleModel: raw.vehicleModel,
    vehiclePhotoUrl: raw.vehiclePhotoUrl ?? null,
    categoryName: raw.categoryName,
    schedule: raw.schedule,
    additionalInfo: raw.additionalInfo ?? null,
    job: raw.job ?? null,
  };
}
}
