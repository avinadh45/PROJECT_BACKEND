export interface UserBookingSummaryDTO {
  id: string;
  vehicleRegistractionNumber: string;
   vehiclePhotoUrl: string | null;
  categoryName: string;
  garageName: string;
  visitType: "drive-in" | "pickup-drop";
  schedule: {
    date: string;
    slotStartingTime: string;
    slotEndingTime: string;
  };
  status: string;
  advancePaymentStatus: "pending" | "paid" | "failed";
}
