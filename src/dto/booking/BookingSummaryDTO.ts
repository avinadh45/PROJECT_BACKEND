export interface BookingSummaryDTO {
  id: string;
  customerName: string;
  vehicleRegistrationNumber: string;
  categoryName: string;
  visitType: "drive-in" | "pickup-drop";
  schedule: {
    data: string;
    slotStartingTime: string;
    slotEndingTime: string;
  };
  mechanicName: string | null;
  status: string;
  advancePaymentStatus: "pending" | "paid" | "failed";
}
