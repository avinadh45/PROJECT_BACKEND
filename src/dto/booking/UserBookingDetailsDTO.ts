export interface UserBookingDetailDTO {
  id: string;
  status: string;
  visitType: "drive-in" | "pickup-drop";
  vehicleRegistrationNumber: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePhotoUrl: string | null;
  categoryName: string;
  serviceCenterId: string;
  garageName: string;
  garagePhone: string;
  garageEmail: string;
  garageAddress: string | null;
  mechanicName: string | null;
  schedule: { date: string; slotStartingTime: string; slotEndingTime: string };
  additionalInfo: string | null;
  statusTimeline: { status: string; updatedBy: string; at: Date }[];
  job: {
    reportedIssue: string;
    estimatedTime: string;
    estimatedCost: number;
    description: any[];
  } | null;
  proof: { imageUrl: string; uploadedBy: string; uploadedAt: string } | null;
  pickupLocation: { type: "Point"; coordinates: number[]; formatedAddress: string } | null;
  advancePayment: { amount: number; status: "pending" | "paid" | "failed"; paidAt?: Date };
}