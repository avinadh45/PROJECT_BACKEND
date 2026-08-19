import mongoose, { Schema, HydratedDocument,Model } from "mongoose";
import { IServiceCenter } from "../interface/ServiceCenter/IServiceCenter";

export type ServiceCenterDocument = HydratedDocument<IServiceCenter>;


const serviceCenterSchema = new Schema<IServiceCenter>(
{
  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  isBlocked: {
    type: Boolean,
    default: false
  },
  isverified:{
    type:Boolean,
    default:false
  },
verificationStatus: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending"
},
  resetToken: {
  type: String,
  default: null,
},
resetTokenExpiry: {
  type: Date,
  default: null,
},

  providerProfile: {
    garageName: {
      type: String,
      required: true
    },

    ownerName: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    garageProfileImage: String,

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },

      coordinates: {
        type: [Number]
      }
    },

    formattedAddress: String,
    
    documents: {

  garageLicense: {

    url: {  
      type: String,
    },

    public_id: {
      type: String,
    }
  },

  ownerIdProof: {

    url: {
      type: String,
    },

    public_id: {
      type: String,
    }
  }
},
  },

  availability: {
    workingDays: [String],

    workingHours: {
      start: String,
      end: String
    },

    slotDuration: Number,

    maxBookingsPerSlot: Number
  },

  servicesOffered: [
    {
      serviceId: {
        type: Schema.Types.ObjectId,
        ref: "Category"
      },

      advanceFee: {type:Number,default:null},

      status: {
        type: String,
        default: "active"
      },

      vehicleTypes: [String],

      serviceModes: [String]
    }
  ],

  rejectionReason: {
   type: String,
   default: ""
},

rejectionDetails: {
   type: String,
   default: ""
},

reviewedAt: {
   type: Date
},

approvedAt: {
   type: Date
},

rejectedAt: {
   type: Date
},

  subscription: {
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Subscription"
    },

    startDate: Date,

    endDate: Date,

    status: {
      type: String,
      enum: ["active","expired"]
    }
  }

},

{ timestamps: true }
);

serviceCenterSchema.index({ "providerProfile.location": "2dsphere" });

const ServiceCenter: Model<IServiceCenter> =
  mongoose.model<IServiceCenter>(
    "ServiceCenter",
    serviceCenterSchema
  );

export default ServiceCenter