import mongoose, { Schema } from "mongoose";
import { ISubscription } from "../interface/subscription/subscriptionInterface";

const PricingSchema = new Schema(
  {
    durationMonths: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const SubscriptionSchema = new Schema<ISubscription>({

  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  features: {
    type: [String],
    default: [],
  },

  pricing:{
    type:[PricingSchema],
    required:true
  },

  status:{
    type:String,
    enum:["active","inactive"],
    default:"active",
  }
},
{timestamps:true}
);
export const Subscription = mongoose.model("Subscription",SubscriptionSchema)