import { IConcernService } from "../../interface/concern/IConcernService";
import {
  IConcernReadRepository,
  IConcernWriteRepository,
} from "../../interface/concern/IConcernRepository";
import { IBookkingReadRepository,IBookingWriteRepository } from "../../interface/Booking/IBookingRepository";
import {
  CreateConcernDTO,
  ConcernSummaryDTO,
  ConcernListSummaryDTO,ConcernDetailDTO,
  RespondToConcernDTO,
  UserConcernDetailDTO
} from "../../dto/concern/concernDTO";
import { AppError } from "../../utils/AppError";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { Types } from "mongoose";
import { ConcernMapper } from "../../mapper/concern/concernMapper";
import { PaginatedResponse } from "../../interface/common/pagination";
import { ScheduleConcernVisitDTO } from "../../dto/concern/ScheduleConcernVisitDTO";
import { ISlotReadRepository,ISlotWriteRepository } from "../../interface/slot/ISlotRepository";
import { IMechanicReadRepository } from "../../interface/Machanic/IMechanicReadRepository";


export class ConcernService implements IConcernService {
  constructor(
    private _concernRepo: IConcernReadRepository & IConcernWriteRepository,
    private _bookingRepo: IBookkingReadRepository&IBookingWriteRepository,
    private _slotRepo:ISlotReadRepository&ISlotWriteRepository,
    private _mechanicRepo:IMechanicReadRepository
  ) {}

  async createConcern(
    userId: string,
    data: CreateConcernDTO,
    proof?: { imageUrl?: string; videoUrl?: string },
  ): Promise<ConcernSummaryDTO> {
    console.log(data.bookingId, "booking id in the service");

    const booking = await this._bookingRepo.findById(data.bookingId);

    if (!booking || booking.userId.toString() !== userId) {
      throw new AppError(MESSAGES.BOOKING.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (booking.status !== "completed") {
      throw new AppError(
        MESSAGES.CONCERN.BOOKING_NOT_COMPLETED,
        HttpStatus.BAD_REQUEST,
      );
    }
    const completedEntry = [...booking.statusTimeline]
      .reverse()
      .find((t) => t.status === "completed");
    if (!completedEntry) {
      throw new AppError(
        MESSAGES.CONCERN.BOOKING_NOT_COMPLETED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const CONCERN_ELIGIBILITY_DAYS = 7;
    const daySinceComplete =
      (Date.now() - new Date(completedEntry.at).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daySinceComplete > CONCERN_ELIGIBILITY_DAYS) {
      throw new AppError(
        MESSAGES.CONCERN.WINDOW_EXPIRED,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this._concernRepo.findActiveByBooking(
      data.bookingId,
    );
    if (existing) {
      throw new AppError(MESSAGES.CONCERN.CONCERN_EXIST, HttpStatus.CONFLICT);
    }

    const concernProof =
      proof && (proof.imageUrl || proof.videoUrl) ? [proof] : [];

    const concern = await this._concernRepo.create({
      bookingId: new Types.ObjectId(data.bookingId),
      userId: new Types.ObjectId(userId),
      serviceCenterId: booking.serviceCenterId,
      issueTittle: data.issueTitle,
      description: data.description,
      proof: concernProof,
      status: "pending",
      timeline: [{ status: "pending", updatedBy: userId, at: new Date() }],
    });
    return ConcernMapper.toSummaryDTO(concern);
  }
  async getServiceCenterConcerns(
    serviceCenterId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<PaginatedResponse<ConcernListSummaryDTO>> {
    const result = await this._concernRepo.findByServiceCenter(
      serviceCenterId,
      page,
      limit,
      status,
    );
    return { ...result, data: result.data.map(ConcernMapper.toListSummaryDTO) };
  }
   async getConcernDetails(serviceCenterId: string, concernId: string): Promise<ConcernDetailDTO> {
    
    const result = await this._concernRepo.findConcernDetails(concernId,serviceCenterId) 
    if(!result){
        throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    return ConcernMapper.toDetailDTO(result)
  }
 async responceClient(servicCenterId: string, concernId: string, dto: RespondToConcernDTO): Promise<ConcernDetailDTO> {
     
    if(dto.rejected && !dto.rejectReason){
        throw new AppError(MESSAGES.CONCERN.REJECT_REASON_REQUIRED,HttpStatus.BAD_REQUEST)
    }
    const update = await this._concernRepo.respond(concernId,servicCenterId,dto.rejected,dto.rejectReason)
    if(!update){
        throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
    }
    const details = await this._concernRepo.findConcernDetails(concernId,servicCenterId) 
    return ConcernMapper.toDetailDTO(details)
 }

 async scheduleConcernVisit(userId: string, concernId: string, dto: ScheduleConcernVisitDTO): Promise<ConcernDetailDTO> {
   
  const concern = await this._concernRepo.findById(concernId)

  if(!concern || concern.userId.toString() !== userId){
    throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
  }
  if(concern.status !== "approved"){
    throw new AppError(MESSAGES.CONCERN.NOT_APPROVED,HttpStatus.BAD_REQUEST)
  }
  const originalBooking = await this._bookingRepo.findById(concern.bookingId.toString())

  if(!originalBooking){
    throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
  }
  const slot = await this._slotRepo.findByServiceCenterAndData(concern.serviceCenterId.toString(),dto.date)

  const targetSlot = slot.find((s)=> s.time === dto.slotStartingTime)
  if(!targetSlot || targetSlot.status === "blocked" || targetSlot.bookedCount >= targetSlot.MaxBooking){
    throw new AppError(MESSAGES.BOOKING.NOT_AVAILABLE,HttpStatus.CONFLICT)
  }

  const newBooking = await this._bookingRepo.create({
    userId:new Types.ObjectId(userId),
    serviceCenterId:originalBooking.serviceCenterId,
    vehicleId:originalBooking.vehicleId,
    categoryId:originalBooking.categoryId,
    visitType:"drive-in",
     schedule: { date: dto.date, slotStartingTime: dto.slotStartingTime, slotEndingTime: dto.slotEndingTime },
     additionalInfo:`Follow-up visit for concern: ${concern.issueTittle}`,
     status:"confirmed",
     statusTimeline: [{ status: "confirmed", updatedBy: userId, at: new Date() }],
     advancePayment:{amount:0,status:"paid"},
     originalBookingId: originalBooking._id,
     concernId: concern._id,
  }as any)

  const mechanic = await this._mechanicRepo.findAvailableMechanic(originalBooking.serviceCenterId.toString())
  if(mechanic){
    newBooking.mechanicId = new Types.ObjectId(mechanic._id)
    newBooking.status = "assigned",
     newBooking.statusTimeline.push({ status: "assigned", updatedBy: "system", at: new Date() });
     await newBooking.save()
  }
  await this._slotRepo.incrementBookedCount(concern.serviceCenterId.toString(),dto.date,dto.slotStartingTime)
  const updated = await this._concernRepo.markSchedule(concernId,newBooking._id.toString(),userId)
  return ConcernMapper.toDetailDTO(await this._concernRepo.findConcernDetails(concernId,concern.serviceCenterId.toString()))
 }

 async getUserConcernDetail(userId: string, concernId: string): Promise<UserConcernDetailDTO> {
   
  const data = await this._concernRepo.findUserConcernDetail(concernId,userId)
  if(!data){
    throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.OK)
  }
  return ConcernMapper.toUserDetailDTO(data)
 }
}
