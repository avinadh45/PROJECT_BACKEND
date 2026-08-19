import mongoose, { Schema, Model } from "mongoose";
import { ISlot } from "../interface/slot/ISlot";

const SlotSchema = new Schema<ISlot>({
  serviceCenterId: {
    type: Schema.Types.ObjectId,
    ref: "ServiceCenter",
    required: true,
  },
  date:{type:String,required:true},
  time:{ type:String,required:true},
  MaxBooking:{type:Number,required:true},
  bookedCount:{ type:Number,default:0},
  status:{
    type:String,
    enum:["available","full","blocked"],
    default:"available",
  }
},
{timestamps:true}
);
SlotSchema.index({ serviceCenterId: 1 , date:1 , time:1 },{unique:true})

const Slot: Model<ISlot> = mongoose.model<ISlot>("Slot",SlotSchema)

export default Slot