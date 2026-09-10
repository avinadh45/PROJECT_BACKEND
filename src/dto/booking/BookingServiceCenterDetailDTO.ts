export interface BookingServiceCenterDetailDTO {
  id: string;
  status: string;
  visitType: "drive-in" | "pickup-drop";
  customerName: string;
  customerPhone: string;
  vehicleRegistrationNumber: string;
  vehicleType: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehiclePhotoUrl: string | null;
  categoryName: string;
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
  pickupLocation:{
    type:"Point";
    coordinates:[];
    formattedAddress:string;
  }|null
  advancePayment: { amount: number;  status: "pending" | "paid" | "failed" | "refund_due" | "refunded" ; paidAt?: Date; refundedAt?:Date };
}