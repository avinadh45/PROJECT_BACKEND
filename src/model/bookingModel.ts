import mongoose, { Schema, Model } from "mongoose";
import { IBooking } from "../interface/Booking/IBookking";

const PickupLocationSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
    formatedAddress: { type: String },
  },
  { _id: false }
);

const PaymentRecordSchema = new Schema({
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  method: { type: String },
  paidAt: { type: Date },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
});

const BookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  serviceCenterId: {
    type: Schema.Types.ObjectId,
    ref: "ServiceCenter",
    required: true,
  },
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  mechanicId: { type: Schema.Types.ObjectId, ref: "User" },
 visitType: { type: String, enum: ["drive-in", "pickup-drop"], required: true },

  pickupLocation: { type: PickupLocationSchema, required: false },

  schedule: {
    date: { type: String, required: true },
    slotStartingTime: { type: String, required: true },
    slotEndingTime: { type: String, required: true },
  },
  status: { type: String, default: "pending" },
  statusTimeline: [
    {
      status: { type: String, required: true },
      updatedBy: { type: String, required: true },
      at: { type: Date, default: Date.now },
    },
  ],
  job: {
    reportedIssue: { type: String },
    estimatedTime: { type: String },
    estimatedCost: { type: String },
    description: [
      {
        jobItemsId: { type: String },
        issueFound: { type: String },
        spareParts: { type: String },
        sparePartQty: { type: Number },
        estimatedTime: { type: String },
        initalCost: { type: Number },
      },
    ],
  },
  progressTasks: [
    {
      taskName: { type: String },
      status: { type: String },
    },
  ],
  proof:{
    imageUrl:{ type:String},
    uploadedBy:{ type:String},
    uploadedAt:{ type:String},
  },
  invoice:{
    invoiceNumber:{type:String},
    labourCharges:[{
      description: { type: String},
      amount:{ type:Number}
    }],
    spareParts:[{
      name:{ type:String},
      qty:{ type:Number},
      unitPrice:{ type:Number},
      total:{type:Number}
    }],
    summary:{
      labourTotal: { type:Number},
      partsTotal:{ type:Number},
      platformFee:{ type:Number},
      advancePaid:{ type:Number},
      grandTotal:{ type:Number},
    },
  },
  advancePayment: { type: PaymentRecordSchema,required:true},
  finalPayment:{ type:PaymentRecordSchema},
},
{timestamps:true}
);
BookingSchema.index({serviceCenterId:1,"schedule.date":1})
BookingSchema.index({userId:1,createdAt:-1})
const Booking:Model<IBooking> = mongoose.model<IBooking>("Booking",BookingSchema)
export default Booking