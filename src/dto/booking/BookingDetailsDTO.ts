export interface BookingDetailDTO {
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
  schedule: {
    date: string;
    slotStartingTime: string;
    slotEndingTime: string;
  };
  additionalInfo: string | null;
  job: {
    reportedIssue: string;
    estimatedTime: string;
    estimatedCost: number;
    description: any[];
  } | null;
  proof: {
  imageUrl: string;
  uploadedBy: string;
  uploadedAt: string;
} | null;
}