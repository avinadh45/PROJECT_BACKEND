import { Schema, model,Types } from "mongoose";
import { IInvoice, IInvoiceItem , InvoicePaymentStatus} from "../interface/Invoice/Iinvoice";
import { IInvoiceDocument } from "../interface/Invoice/Iinvoice";

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    sparePart: String,
    quantity: { type: Number, required: true, default: 1 },
    cost: { type: Number, required: true },
  },
  { _id: false },
);

const invoiceSchema = new Schema<IInvoiceDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceCenterId: { type: Schema.Types.ObjectId, ref: "ServiceCenter", required: true, index: true },
    mechanicId: { type: Schema.Types.ObjectId, ref: "Mechanic", required: true },

    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },

    advancePaid: { type: Number, required: true },
    balanceDue: { type: Number, required: true },

    platformFeeAmount: { type: Number, required: true },
    platformFeePercentage: { type: Number, required: true },
    serviceCenterPayout: { type: Number, required: true },

    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentId: String,
    generatedBy: { type: Schema.Types.ObjectId, ref: "ServiceCenter", required: true },
    paidAt: {type:Date}
  },
  { timestamps: { createdAt: "generatedAt", updatedAt: true } },
);


export const InvoiceModel = model<IInvoiceDocument>("Invoice", invoiceSchema);
export default InvoiceModel