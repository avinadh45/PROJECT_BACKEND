export interface InvoiceItemDTO {
  description: string;
  sparePart?: string;
  quantity: number;
  cost: number;
}

export interface InvoiceResponseDTO {
  id: string;
  bookingId: string;
  items: InvoiceItemDTO[];
  subtotal: number;
  advancePaid: number;
  balanceDue: number;
  paymentStatus: string;
  paymentId?: string;
  generatedAt: Date;
}

export interface ServiceCenterInvoiceResponseDTO extends InvoiceResponseDTO {
  platformFeePercentage: number;
  platformFeeAmount: number;
  serviceCenterPayout: number;
}