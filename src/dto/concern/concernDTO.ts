export interface CreateConcernDTO {
  bookingId: string;
  issueTitle: string;
  description: string;
}

export interface ConcernSummaryDTO {
  id: string;
  bookingId: string;
  issueTitle: string;
  status: "pending" | "approved" | "rejected" | "scheduled" | "resolved";
  createdAt: Date;
}

export interface ConcernDetailDTO {
  id: string;
  bookingId: string;
  issueTitle: string;
  description: string;
  proof: { imageUrl?: string; videoUrl?: string }[];
  status: "pending" | "approved" | "rejected" | "scheduled" | "resolved";
  providerResponse?: { rejected: boolean; rejectReason?: string; respondedAt?: Date };
  vehicleRegistrationNumber: string;
  categoryName: string;
  garageName: string;
  originalServiceDate: string;
  timeline: { status: string; updatedBy: string; at: Date }[];
  createdAt: Date;
}
export interface ConcernListSummaryDTO {
  id: string;
  issueTitle: string;
  status: string;
  customerName: string;
  vehicleRegistrationNumber: string;
  createdAt: Date;
}

export interface RespondToConcernDTO {
  rejected: boolean;
  rejectReason?: string;
}

export interface UserConcernDetailDTO {
  id: string;
  bookingId: string;
  serviceCenterId: string;
  issueTitle: string;
  description: string;
  proof: { imageUrl?: string; videoUrl?: string }[];
  status: "pending" | "approved" | "rejected" | "scheduled" | "resolved";
  providerResponse?: { rejected: boolean; rejectReason?: string; respondedAt?: Date };
  resolutionBookingId?: string;
  vehicleRegistrationNumber: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePhotoUrl: string | null;
  categoryName: string;
  garageName: string;
  originalServiceDate: string;
  timeline: { status: string; updatedBy: string; at: Date }[];
  createdAt: Date;
}