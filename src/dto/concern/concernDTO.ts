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
