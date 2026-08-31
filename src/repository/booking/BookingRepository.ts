import { Types } from "mongoose";
import Booking from "../../model/bookingModel";
import { IBooking } from "../../interface/Booking/IBookking";
import ServiceCenter from "../../model/ServiceCenterModel";
import {
  IBookingWriteRepository,
  IBookkingReadRepository,
} from "../../interface/Booking/IBookingRepository";

export class BookingRepository
  implements IBookingWriteRepository, IBookkingReadRepository
{
  async findByRazorpayOrderId(orderId: string) {
    return Booking.findOne({ "advancePayment.razorpayOrderId": orderId });
  }

  async getAdvanceFeeForService(
    serviceCenterId: string,
    categoryId: string,
  ): Promise<number | null> {
    const center = await ServiceCenter.findOne(
      {
        _id: new Types.ObjectId(serviceCenterId),
        servicesOffered: {
          $elemMatch: {
            serviceId: new Types.ObjectId(categoryId),
            status: "active",
          },
        },
      },
      { "servicesOffered.$": 1 },
    );
    const advanceFee = center?.servicesOffered?.[0]?.advanceFee;
    return typeof advanceFee === "number" ? advanceFee :null;

  }
  async create(data: Partial<IBooking>): Promise<IBooking & { save: () => Promise<any>; }> {
      return Booking.create(data)
  }

  async findById(bookingId: string): Promise<IBooking | null> {
    
    return await Booking.findById(bookingId)
  }
}
