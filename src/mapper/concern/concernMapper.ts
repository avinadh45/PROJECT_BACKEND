import { IConcern } from "../../interface/concern/IConcern";
import {
  ConcernSummaryDTO,
  UserConcernDetailDTO,
} from "../../dto/concern/concernDTO";
import { ConcernListSummaryDTO } from "../../dto/concern/concernDTO";
import { ConcernDetailDTO } from "../../dto/concern/concernDTO";
export class ConcernMapper {
  static toSummaryDTO(concern: IConcern): ConcernSummaryDTO {
    return {
      id: concern._id.toString(),
      bookingId: concern.bookingId.toString(),
      issueTitle: concern.issueTittle,
      status: concern.status,
      createdAt: concern.createAt!,
    };
  }
  static toListSummaryDTO(raw: any): ConcernListSummaryDTO {
    return {
      id: raw._id.toString(),
      issueTitle: raw.issueTitle,
      status: raw.status,
      customerName: raw.customerName,
      vehicleRegistrationNumber: raw.vehicleRegistrationNumber,
      createdAt: raw.createdAt,
    };
  }
  static toDetailDTO(raw: any): ConcernDetailDTO {
    return {
      id: raw._id.toString(),
      bookingId: raw.bookingId.toString(),
      issueTitle: raw.issueTitle,
      description: raw.description,
      proof: raw.proof ?? [],
      status: raw.status,
      providerResponse: raw.providerResponse ?? undefined,
      vehicleRegistrationNumber: raw.vehicleRegistrationNumber,
      categoryName: raw.categoryName,
      garageName: raw.garageName,
      originalServiceDate: raw.originalServiceDate,
      timeline: raw.timeline ?? [],
      createdAt: raw.createdAt,
    };
  }
  static toUserDetailDTO(raw: any): UserConcernDetailDTO {
    return {
      id: raw._id.toString(),
      bookingId: raw.bookingId.toString(),
      serviceCenterId: raw.serviceCenterId.toString(),
      issueTitle: raw.issueTitle,
      description: raw.description,
      proof: raw.proof ?? [],
      status: raw.status,
      providerResponse: raw.providerResponse ?? undefined,
      resolutionBookingId: raw.resolutionBookingId?.toString(),
      vehicleRegistrationNumber: raw.vehicleRegistrationNumber,
      vehicleBrand: raw.vehicleBrand,
      vehicleModel: raw.vehicleModel,
      vehiclePhotoUrl: raw.vehiclePhotoUrl ?? null,
      categoryName: raw.categoryName,
      garageName: raw.garageName,
      originalServiceDate: raw.originalServiceDate,
      timeline: raw.timeline ?? [],
      createdAt: raw.createdAt,
    };
  }
}
