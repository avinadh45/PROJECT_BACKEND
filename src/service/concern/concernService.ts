import { IConcernService } from "../../interface/concern/IConcernService";
import {
  IConcernReadRepository,
  IConcernWriteRepository,
} from "../../interface/concern/IConcernRepository";
import { IBookkingReadRepository } from "../../interface/Booking/IBookingRepository";
import {
  CreateConcernDTO,
  ConcernSummaryDTO,
  ConcernListSummaryDTO,ConcernDetailDTO,
  RespondToConcernDTO
} from "../../dto/concern/concernDTO";
import { AppError } from "../../utils/AppError";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { Types } from "mongoose";
import { ConcernMapper } from "../../mapper/concern/concernMapper";
import { PaginatedResponse } from "../../interface/common/pagination";

export class ConcernService implements IConcernService {
  constructor(
    private _concernRepo: IConcernReadRepository & IConcernWriteRepository,
    private _bookingRepo: IBookkingReadRepository,
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
}
