import { GarageFilterDTO } from "../../dto/booking/GarageFilterDTO";
import { GarageSearchResultDTO } from "../../dto/booking/GarageResultDTO";
import { IBookingService } from "../../interface/Booking/IBookingService";
import { IServiceCenterRepository } from "../../interface/ServiceCenter/IServiceCenterRepository";
import { BookingMapper } from "../../mapper/booking/BookingMapper";
import { IBookingWriteRepository } from "../../interface/Booking/IBookingRepository";
import { IBookkingReadRepository } from "../../interface/Booking/IBookingRepository";
import {
  BookingConfirmationDTO,
  BookingOrderDTO,
  BookingOrderResultDTO,
  VerifyBookingPaymentDTO,
} from "../../dto/booking/BookingOrderDTO";
import {
  ISlotReadRepository,
  ISlotWriteRepository,
} from "../../interface/slot/ISlotRepository";
import { AppError } from "../../utils/AppError";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { getRazorpayInstance } from "../../utils/razorpay";
import mongoose, { Types } from "mongoose";
import crypto from "crypto";
import { IMechanicReadRepository } from "../../interface/Machanic/IMechanicReadRepository";
import { BookingSummaryDTO } from "../../dto/booking/BookingSummaryDTO";
import { PaginatedResponse } from "../../interface/common/pagination";
import { BookingDetailDTO } from "../../dto/booking/BookingDetailsDTO";
import { IJobDescriptionItem } from "../../interface/Booking/IBookking";
import { BookingServiceCenterDetailDTO } from "../../dto/booking/BookingServiceCenterDetailDTO";
import { UserBookingSummaryDTO } from "../../dto/booking/UserBookingSummaryDTO";
import { UserBookingDetailDTO } from "../../dto/booking/UserBookingDetailsDTO";
import { RescheduleBookingDTO } from "../../dto/booking/RescheduleBookingDTO";

export class BookingService implements IBookingService {
  constructor(
    private _serviceCenterRepo: IServiceCenterRepository,
    private _bookingRepo: IBookingWriteRepository & IBookkingReadRepository,
    private _slotRapo: ISlotReadRepository & ISlotWriteRepository,
    private _mechanicRepo: IMechanicReadRepository,
  ) {}

  async findAvailableGarages(
    dto: GarageFilterDTO,
  ): Promise<GarageSearchResultDTO[]> {
    const result = await this._serviceCenterRepo.findAvailableGarage({
      categoryId: dto.categoryId,
      serviceMode: dto.serviceMode,
      vehicleType: dto.vehicleType,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
    return result.map(BookingMapper.toSearchResultDTO);
  }

  async createBookingOrder(
    userId: string,
    dto: BookingOrderDTO,
  ): Promise<BookingOrderResultDTO> {
    const slots = await this._slotRapo.findByServiceCenterAndData(
      dto.serviceCenterId,
      dto.schedule.date,
    );
    const targetSlot = slots.find(
      (s) => s.time === dto.schedule.slotStartingTime,
    );

    if (
      !targetSlot ||
      targetSlot.status === "blocked" ||
      targetSlot.bookedCount >= targetSlot.MaxBooking
    ) {
      throw new AppError(MESSAGES.BOOKING.NOT_AVAILABLE, HttpStatus.CONFLICT);
    }
    const advanceFee = await this._bookingRepo.getAdvanceFeeForService(
      dto.serviceCenterId,
      dto.categoryId,
    );

    if (!advanceFee) {
      throw new AppError(MESSAGES.BOOKING.NO_SERVICE, HttpStatus.NOT_FOUND);
    }
    const order = await getRazorpayInstance().orders.create({
      amount: advanceFee * 100,
      currency: "INR",
      receipt: `booking_${Date.now()}`,
    });
    const booking = await this._bookingRepo.create({
      userId: new Types.ObjectId(userId),
      serviceCenterId: new Types.ObjectId(dto.serviceCenterId),
      vehicleId: new Types.ObjectId(dto.vehicleId),
      categoryId: new Types.ObjectId(dto.categoryId),
      visitType: dto.visitType,
      pickupLocation: dto.pickupLocation as any,
      additionalInfo: dto.additionalInfo,
      schedule: dto.schedule,
      status: "pending_payment",
      statusTimeline: [
        { status: "pending_payment", updatedBy: userId, at: new Date() },
      ],
      advancePayment: {
        amount: advanceFee,
        status: "pending",
        razorpayOrderId: order.id,
      } as any,
    });
    return {
      razorpayOrderId: order.id,
      amount: advanceFee,
      bookingId: booking._id.toString(),
    };
  }

  async verifyBookingPayment(
    userId: string,
    dto: VerifyBookingPaymentDTO,
  ): Promise<BookingConfirmationDTO> {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${dto.razorpayOrderId}|${dto.razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== dto.razorpaySignature) {
      throw new AppError(
        MESSAGES.BOOKING.PAYMENT_VERIFICATION_FAIL,
        HttpStatus.BAD_REQUEST,
      );
    }
    const booking = await this._bookingRepo.findByRazorpayOrderId(
      dto.razorpayOrderId,
    );
    if (!booking || booking.userId.toString() !== userId) {
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const slot = await this._slotRapo.findByServiceCenterAndData(
      booking.serviceCenterId.toString(),
      booking.schedule.date,
    );

    const targetSlot = slot.find(
      (s) => s.time === booking.schedule.slotStartingTime,
    );

    if (
      !targetSlot ||
      targetSlot.status === "blocked" ||
      targetSlot.bookedCount >= targetSlot.MaxBooking
    ) {
      ((booking.status = "failed_slot_unavailable"), await booking.save());
      throw new AppError(MESSAGES.BOOKING.SLOT_TAKEN, HttpStatus.CONFLICT);
    }
    booking.advancePayment.status = "paid";
    booking.advancePayment.razorpayPaymentId = dto.razorpayPaymentId;
    booking.advancePayment.paidAt = new Date();

    const mechanic = await this._mechanicRepo.findAvailableMechanic(
      booking.serviceCenterId.toString(),
    );
    if (mechanic) {
      booking.mechanicId = new mongoose.Types.ObjectId(mechanic._id);
      ((booking.status = "assigned"),
        booking.statusTimeline.push(
          { status: "confirmed", updatedBy: userId, at: new Date() },
          { status: "assigned", updatedBy: "sytem", at: new Date() },
        ));
    } else {
      ((booking.status = "confirmed"),
        booking.statusTimeline.push({
          status: "confirmed",
          updatedBy: userId,
          at: new Date(),
        }));
    }
    await booking.save();
    await this._slotRapo.incrementBookedCount(
      booking.serviceCenterId.toString(),
      booking.schedule.date,
      booking.schedule.slotStartingTime,
    );

    return BookingMapper.toConfirmationDTO(booking);
  }

  async getBooking(
    userId: string,
    bookingId: string,
  ): Promise<BookingConfirmationDTO> {
    const booking = await this._bookingRepo.findById(bookingId);
    if (!booking || booking.userId.toString() !== userId) {
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return BookingMapper.toConfirmationDTO(booking);
  }

  async getServiceCenterBookings(
    serviceCenterId: string,
    page: number,
    limit: number,
    status?: string,
    search?: string,
  ): Promise<PaginatedResponse<BookingSummaryDTO>> {
    const result = await this._bookingRepo.findByServiceCenter(
      serviceCenterId,
      page,
      limit,
      status,
      search,
    );
    return { ...result, data: result.data.map(BookingMapper.toSummaryDTO) };
  }
  async getMechanicBooking(
    mechanicId: string,
    page: number,
    limit: number,
    status?: string,
    search?: string,
  ): Promise<PaginatedResponse<BookingSummaryDTO>> {
    const result = await this._bookingRepo.findByMechanic(
      mechanicId,
      page,
      limit,
      status,
      search,
    );
    return { ...result, data: result.data.map(BookingMapper.toSummaryDTO) };
  }

  async getBookingInMechanci(
    mechanicId: string,
    bookingId: string,
  ): Promise<BookingDetailDTO> {
    const data = await this._bookingRepo.findMechanicBookingDetails(
      bookingId,
      mechanicId,
    );
    if (!data) {
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return BookingMapper.toDetailDTO(data);
  }

  async updateMechanicJobItems(
    mechanicId: string,
    bookingId: string,
    items: IJobDescriptionItem[],
  ): Promise<BookingDetailDTO> {
    const update = await this._bookingRepo.updateJobItems(
      bookingId,
      mechanicId,
      items,
    );
    if (!update) {
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const details = await this._bookingRepo.findMechanicBookingDetails(
      bookingId,
      mechanicId,
    );
    return BookingMapper.toDetailDTO(details);
  }

  async updateStatus(
    bookingId: string,
    mechanicId: string,
    status: string,
  ): Promise<BookingDetailDTO> {
    const statuses = ["assigned", "in-progress", "completed"];
    if (!statuses.includes(status)) {
    }
    const update = await this._bookingRepo.updateStatus(
      bookingId,
      mechanicId,
      status,
      mechanicId,
    );
    if (!update) {
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const details = await this._bookingRepo.findMechanicBookingDetails(
      bookingId,
      mechanicId,
    );
    return BookingMapper.toDetailDTO(details);
  }

  async uploadProof(
    bookingId: string,
    mechanicId: string,
    imageUrl: string,
  ): Promise<BookingDetailDTO> {
    const upload = await this._bookingRepo.uploadProof(
      bookingId,
      mechanicId,
      imageUrl,
    );
    if (!upload) {
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const details = await this._bookingRepo.findMechanicBookingDetails(
      bookingId,
      mechanicId,
    );
    return BookingMapper.toDetailDTO(details);
  }
  async getServiceCenterBookingDetails(
    bookingId: string,
    serviceCenterId: string,
  ): Promise<BookingServiceCenterDetailDTO> {
    const data = await this._bookingRepo.findServiceCenterBookingDetails(
      bookingId,
      serviceCenterId,
    );
    if (!data) {
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return BookingMapper.toServiceCenterDetailDTO(data);
  }
  async getUserBooking(
    userId: string,
    page: number,
    limit: number,
    status?: string,
    search?: string,
  ): Promise<PaginatedResponse<UserBookingSummaryDTO>> {
    const result = await this._bookingRepo.findByUser(
      userId,
      page,
      limit,
      status,
      search,
    );
    return { ...result, data: result.data.map(BookingMapper.toUserSummaryDTO) };
  }
  async getUserBookingDetail(userId: string, bookingId: string): Promise<UserBookingDetailDTO> {
      
    const data = await this._bookingRepo.findUserBookingDetails(bookingId,userId) 
    if(!data){
        throw new AppError(MESSAGES.BOOKING.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    return BookingMapper.toUserDetailDTO(data)
  }

  async cancelBooking(userId: string, bookingId: string): Promise<BookingConfirmationDTO> {
      
    const booking = await this._bookingRepo.findById(bookingId)

    if(!booking || booking.userId.toString() !== userId){
        throw new AppError(MESSAGES.BOOKING.NOT_FOUND,HttpStatus.NOT_FOUND)
    }

    const previousStatus = booking.status

    const cancellable = ["pending_payment","confirmed","assigned"] 

    if(!cancellable.includes(previousStatus)){
        throw new AppError(MESSAGES.BOOKING.CANNOT_CANCEL,HttpStatus.BAD_REQUEST)
    }

    const slotDateTime = new Date(`${booking.schedule.date}T${booking.schedule.slotStartingTime}:00`)
    const hoursUntilslot = (slotDateTime.getTime() - Date.now())/(1000 * 60 * 60)
    const cancelHour = 2 
    const isWithinCancel = hoursUntilslot<cancelHour 

    if(isWithinCancel){
      throw new AppError(MESSAGES.BOOKING.CANNOT_CANCEL,HttpStatus.BAD_REQUEST)
    }

     booking.status = "cancelled",
     booking.statusTimeline.push({status:"cancelled",updatedBy:userId,at:new Date()}) 
     
     if(previousStatus === "confirmed" || previousStatus === "assigned"){
       
       if(isWithinCancel){
         booking.advancePayment.method = booking.advancePayment.method
        }else{
          booking.advancePayment.status = "refund_due"
        }
        await this._slotRapo.decrementBookedCount(booking.serviceCenterId.toString(),booking.schedule.date,booking.schedule.slotStartingTime)
      }
      await booking.save()
      return BookingMapper.toConfirmationDTO(booking)
  }

  async markBookingRefund(servicCenterId: string, bookingId: string): Promise<BookingServiceCenterDetailDTO> {
    
    const booking = await this._bookingRepo.findById(bookingId)

    if(!booking || booking.serviceCenterId.toString() !== servicCenterId){
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    if(booking.advancePayment.status !== "refund_due"){
      throw new AppError(MESSAGES.BOOKING.REFUND_NOT_DUE,HttpStatus.BAD_REQUEST)
    }
    if(!booking.advancePayment.razorpayPaymentId){
      throw new AppError(MESSAGES.BOOKING.NO_PAYMENT_ID,HttpStatus.BAD_REQUEST)
    }
    
    const refund = await getRazorpayInstance().payments.refund(

      booking.advancePayment.razorpayPaymentId,
      {
        amount: booking.advancePayment.amount*100,
        speed:"normal"
      })
      
      booking.advancePayment.status = "refunded",
      booking.advancePayment.refundedAt = new Date()
      booking.advancePayment.refundId = refund.id 
      await booking.save()
    const detail = await this._bookingRepo.findServiceCenterBookingDetails(bookingId,servicCenterId)
    return BookingMapper.toServiceCenterDetailDTO(detail)
  }

  async rescheduleBooking(userId: string, bookingId: string, dto: RescheduleBookingDTO): Promise<BookingConfirmationDTO> {
    
    const booking = await this._bookingRepo.findById(bookingId)
    if(!booking || booking.userId.toString() !== userId){
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND,HttpStatus.NOT_FOUND)
    }

    const previousStats = booking.status 
    const reschedulableStatuses = [
    "pending_payment",
    "confirmed",
    "assigned",
  ];

    if(!reschedulableStatuses.includes(previousStats)){
      throw new AppError(MESSAGES.BOOKING.CANNOT_RESCHEDULE,HttpStatus.BAD_REQUEST)
    }

    const slotDateTime = new Date(`${booking.schedule.date}T${booking.schedule.slotStartingTime}:00`)
    const hoursUntilslot = (slotDateTime.getTime() - Date.now())/(1000*60*60)
     const rescheduleHour = 5; 

     if(hoursUntilslot <= rescheduleHour){
      throw new AppError(MESSAGES.BOOKING.RESCHEDULE_CUTOFF,HttpStatus.BAD_REQUEST)
     }

     const isSameSlot = booking.schedule.date === dto.date && booking.schedule.slotStartingTime === dto.slotStartingTime 
     if(isSameSlot){
      throw new AppError(MESSAGES.BOOKING.SAME_SLOT,HttpStatus.BAD_REQUEST)
     }

     const oldDate = booking.schedule.date 
     const oldStartingTime = booking.schedule.slotStartingTime 

     const slots = await this._slotRapo.findByServiceCenterAndData(booking.serviceCenterId.toString(),dto.date)

     const targetSlot = slots.find((slot)=> slot.time === dto.slotStartingTime) 

     if(!targetSlot || targetSlot.status === "blocked" || targetSlot.bookedCount >= targetSlot.MaxBooking){
      throw new AppError(MESSAGES.BOOKING.NOT_AVAILABLE,HttpStatus.CONFLICT)
     }

     if(previousStats === "confirmed" || previousStats === "assigned"){
      await this._slotRapo.incrementBookedCount(booking.serviceCenterId.toString(),dto.date,dto.slotStartingTime)
     }

     if(previousStats === "assigned"){
      booking.mechanicId = undefined  

      const mechanic = await this._mechanicRepo.findAvailableMechanic(booking.serviceCenterId.toString())

      if(mechanic){
        booking.mechanicId = new Types.ObjectId(mechanic._id)
        booking.status = "assigned"
      }else{
        booking.status = "confirmed"
      }
     }
     booking.schedule = {date:dto.date,slotStartingTime:dto.slotStartingTime,slotEndingTime:dto.slotStartingTime}

     booking.statusTimeline.push({status:"reschedule",updatedBy:userId,at:new Date()})
     await booking.save()

     if(previousStats === "confirmed" || previousStats === "assigned"){
      await this._slotRapo.decrementBookedCount(booking.serviceCenterId.toString(),oldDate,oldStartingTime)
     }
     return BookingMapper.toConfirmationDTO(booking)
  }
}
