import { Types } from "mongoose";
export interface IInvoiceItem  {

    description: string;
    sparePart?: string;
    quantity: number; 
    cost: number; 
}
 
export type InvoicePaymentStatus = "pending" | "paid" | "failed"; 

 export interface IInvoiceDocument {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  serviceCenterId: Types.ObjectId;
  mechanicId: Types.ObjectId;
  items: IInvoiceItem[];
  subtotal: number;
  advancePaid: number;
  balanceDue: number;
  platformFeePercentage: number;
  platformFeeAmount: number;
  serviceCenterPayout: number;
  paymentStatus: InvoicePaymentStatus;
  paymentId?: string;
  generatedBy: Types.ObjectId;
  paidAt?:Date
}

export interface IInvoice {

      _id?: string;
  bookingId: string;
  userId: string;
  serviceCenterId: string;
  mechanicId: string;

  items: IInvoiceItem[];
  subtotal: number; 

  advancePaid: number; 
  balanceDue : number ;

  platformFeePercentage: number;
  platformFeeAmount: number;
  serviceCenterPayout: number; 

  paymentStatus: InvoicePaymentStatus;
  paymentId?: string;
  generatedAt: Date;
  generatedBy: string; 
}

