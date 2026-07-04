import { Types } from "mongoose";


export interface IServiceCenter {
  _id: Types.ObjectId;
  email: string;
  password: string;
  isBlocked?: boolean;
  isverified?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
  providerProfile: {
    garageName: string;
    ownerName: string;
    phone: string;
    garageProfileImage?: string;

    location?: {
      type: "Point";
      coordinates: number[];
    };

    formattedAddress?: string;

    documents?:{
      garageLicense?:{
        url:string;
        public_id:string;
      };
      ownerIdProof?:{
        url:string;
        public_id:string;
      }
    }
  };

  availability?: {
    workingDays: string[];

    workingHours: {
      start: string;
      end: string;
    };

    slotDuration?: number;

    maxBookingsPerSlot?: number;
  };

  servicesOffered?: {
    serviceId: string;
    advanceFee: number;
    status?: string;
    vehicleTypes: string[];
    serviceModes: string[];
  }[];

  rejectionReason?: string;

rejectionDetails?: string;

reviewedAt?: Date;

approvedAt?: Date;

rejectedAt?: Date;
  subscription?: {
    planId: string;
    startDate: Date;
    endDate: Date;
    status: "active" | "expired";
  };
}
