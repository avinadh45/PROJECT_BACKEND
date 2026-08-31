export interface BookingOrderDTO {
  vehicleId: string;
  categoryId: string;
  serviceCenterId: string;
  visitType: "drive-in" | "pickup-drop";
  pickupLocation?: {
    type: "Point";
    corrdinates: number[];
    formattedAddress: string;
  };
  schedule: {
    date: string;
    slotStartingTime: string;
    slotEndingTime: string;
  };
  additionalInfo?: string;
}
export interface VerifyBookingPaymentDTO {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
export interface BookingConfirmationDTO {
  id: string;
  status: string;
  mechanicAssigned: boolean;
  serviceCenterId: string;
  vehicleId: string;
  categoryId: string;
  visitType: "drive-in" | "pickup-drop";
  schedule: {
    date: string;
    slotStartingTime: string;
    slotEndingTime: string;
  };
  advancePayment:{
    amount:number;
    status:"pending" | "paid" | "failed";
    paidAt?:Date
  }
}
export interface BookingOrderResultDTO {
  razorpayOrderId: string;
  amount: number;
  bookingId: string;
}