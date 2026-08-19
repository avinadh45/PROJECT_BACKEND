import { IServiceCenter } from "../../interface/ServiceCenter/IServiceCenter";
import { ServiceCenterRegisterDTO } from "../../dto/serviceCenter/RegisterDTO";
import { ServiceCenterResponseDTO } from "../../dto/serviceCenter/ServiceCenterResponseDTO.";
import { servicecenterDTO } from "../../dto/admin/ServiceCenterListDTO";
import { serviceCenterDetailsDTO } from "../../dto/admin/serviceCenterDetails";
import { VerificationDetailsDTO } from "../../dto/admin/verificationDTO";
import { VerificationStatusDTO } from "../../dto/serviceCenter/verifistatus";
import { ServiceCenterEditDTO } from "../../dto/serviceCenter/serviceCenterEditDTO";
import { AddServiceDTO } from "../../dto/serviceCenter/addServiceDTO";
import { ServiceOfferedInput } from "../../interface/ServiceCenter/IServiceCenter";
import { ServiceCenterSubscriptionStatusDTO } from "../../interface/subscription/IServiceCenterSubscriptionStatus";
import { ISubscriptionReadRepos } from "../../interface/subscription/ISubscriptionReadRepository";
import { AvailabilityResponseDTO } from "../../dto/serviceCenter/AvailabilityResponseDTO";
import { Types } from "mongoose";
export class ServiceCenterMapper {
  static toEntity(dto: ServiceCenterRegisterDTO): Partial<IServiceCenter> {
    return {
      email: dto.email,
      password: dto.password,
      providerProfile: {
        ownerName: dto.providerProfile.ownerName,
        garageName: dto.providerProfile.garageName,
        phone: dto.providerProfile.phone,
        location: {
          type: dto.providerProfile.location.type,
          coordinates: dto.providerProfile.location.coordinates,
        },

        documents: {
          garageLicense: {
            url: dto.providerProfile.documents.garageLicense.url,
            public_id: dto.providerProfile.documents.garageLicense.public_id,
          },
          ownerIdProof: {
            url: dto.providerProfile.documents.ownerIdProof.url,
            public_id: dto.providerProfile.documents.ownerIdProof.public_id,
          },
        },
      },
      availability: {
        workingDays: dto.availability.workingDays,
        workingHours: {
          start: dto.availability.workingHours.start,
          end: dto.availability.workingHours.end,
        },
      },
      servicesOffered: dto.servicesOffered.map((service) => ({
        serviceId: new Types.ObjectId(service.serviceId),

        advanceFee: 0,

        status: "active",

        vehicleTypes: service.vehicleTypes,

        serviceModes: service.serviceModes,
      })),
    };
  }
  static authResponse(
    entity: IServiceCenter,
    accessToken: string,
    refreshToken: string,
  ): ServiceCenterResponseDTO {
    return {
      id: entity._id.toString(),
      email: entity.email,
      name: entity.providerProfile.ownerName,
      garageName: entity.providerProfile.garageName,
      accessToken,
      refreshToken,
    };
  }
  static toListDTO(entity: IServiceCenter): servicecenterDTO {
    return {
      id: entity._id.toString(),
      name: entity.providerProfile.garageName,
      ownerName: entity.providerProfile.ownerName,
      email: entity.email,
      phoneNumber: entity.providerProfile.phone,
      verificationStatus: entity.verificationStatus ?? "pending",
      isBlocked: entity.isBlocked,
    };
  }
  static toDetailsDTO(entity: IServiceCenter): serviceCenterDetailsDTO {
    return {
      id: entity._id.toString(),
      name: entity.providerProfile.garageName,
      ownerName: entity.providerProfile.ownerName,
      email: entity.email,
      phoneNumber: entity.providerProfile.phone,
      isBlocked: entity.isBlocked ?? false,
      createdAt: entity.createdAt,
    };
  }
  static toVerificationDetailsDTO(
    entity: IServiceCenter,
  ): VerificationDetailsDTO {
    return {
      id: entity._id.toString(),

      email: entity.email,

      verificationStatus: entity.verificationStatus ?? "pending",

      providerProfile: {
        ownerName: entity.providerProfile.ownerName,

        garageName: entity.providerProfile.garageName,

        phone: entity.providerProfile.phone,

        location: {
          type: entity.providerProfile.location?.type ?? "Point",

          coordinates: entity.providerProfile.location?.coordinates ?? [],
        },
        documents: {
          garageLicense: {
            url: entity.providerProfile.documents?.garageLicense?.url ?? "",
          },
          ownerIdProof: {
            url: entity.providerProfile.documents?.ownerIdProof?.url ?? "",
          },
        },
      },
      availability: {
        workingDays: entity.availability?.workingDays ?? [],

        workingHours: {
          start: entity.availability?.workingHours.start ?? "",

          end: entity.availability?.workingHours.end ?? "",
        },
      },
      servicesOffered:
        entity.servicesOffered?.map((service: any) => ({
          serviceId: { name: service.serviceId.name },
          vehicleTypes: service.vehicleTypes,
          serviceModes: service.serviceModes,
        })) ?? [],
      createdAt: entity.createdAt,
    };
  }
  static toVerificationStatusDTO(
    entity: IServiceCenter,
  ): VerificationStatusDTO {
    return {
      status: entity.verificationStatus ?? "pending",

      garageName: entity.providerProfile.garageName,

      submittedAt: entity.createdAt,

      reviewedAt: entity.reviewedAt,

      rejectionReason: entity.rejectionReason,

      rejectionDetails: entity.rejectionDetails,
    };
  }  
  static toEditDTO(entity: IServiceCenter): ServiceCenterEditDTO {


  return {
    garageName:
      entity.providerProfile.garageName,

    ownerName:
      entity.providerProfile.ownerName,

    phone:
      entity.providerProfile.phone,

       email: entity.email, 

    location:
      entity.providerProfile.location!,

    availability: {
      workingDays:
        entity.availability?.workingDays ?? [],

      workingHours: {
        start:
          entity.availability?.workingHours.start ?? "",

        end:
          entity.availability?.workingHours.end ?? "",
      },
    },

    servicesOffered:
      entity.servicesOffered?.map((service) => ({
        serviceId:
  typeof service.serviceId === "object" &&  "_id" in service.serviceId
    ? (service.serviceId as any)._id.toString()
    :  String(service.serviceId),
        advanceFee: service.advanceFee, 
        status: service.status,
        vehicleTypes:
          service.vehicleTypes,

        serviceModes:
          service.serviceModes,
      })) ?? [],

    documents: {
      garageLicense: {
        url:
          entity.providerProfile.documents
            ?.garageLicense?.url ?? "",

        public_id:
          entity.providerProfile.documents
            ?.garageLicense?.public_id ?? "",
      },

      ownerIdProof: {
        url:
          entity.providerProfile.documents
            ?.ownerIdProof?.url ?? "",

        public_id:
          entity.providerProfile.documents
            ?.ownerIdProof?.public_id ?? "",
      },
    },
  };
}
static toServiceOffered(dto: AddServiceDTO): ServiceOfferedInput {
  return {
    serviceId: dto.serviceId,
    advanceFee: dto.advanceFee ?? null,
    status: "active",
    vehicleType: dto.vehicleTypes,
    serviceModes: dto.serviceModes
  };
}
 static async toStatusDTO(
    serviceCenter: IServiceCenter,
    subscriptionReadRepo: ISubscriptionReadRepos
  ): Promise<ServiceCenterSubscriptionStatusDTO> {
    if (!serviceCenter.subscription?.planId) {
      return { hasActiveSubscription: false, subscription: null };
    }

    const { planId, startDate, endDate, status } = serviceCenter.subscription;
    const isExpired = new Date() > new Date(endDate);
    const effectiveStatus: "active" | "expired" = isExpired ? "expired" : status;

    const plan = await subscriptionReadRepo.findById(planId.toString());
    const durationMonths = Math.round(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const tier = plan?.pricing.find((t) => t.durationMonths === durationMonths);

    return {
      hasActiveSubscription: effectiveStatus === "active",
      subscription: {
        planId: planId.toString(),
        planName: plan?.name ?? "Unknown Plan",
        tier: tier ?? { durationMonths, price: 0 },
        startDate,
        expiryDate: endDate,
        status: effectiveStatus,
      },
    };
  }
  static toResponseDTO(serviceCenter: IServiceCenter): AvailabilityResponseDTO {
    const availability = serviceCenter.availability;

    return {
      workingDays: availability?.workingDays ?? [],
      workingHours: availability?.workingHours ?? { start: "", end: "" },
      slotDuration: availability?.slotDuration ?? 0,
      maxBookingsPerSlot: availability?.maxBookingsPerSlot ?? 0,
    };
  }
}
