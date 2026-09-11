import mongoose,{Schema,Model} from "mongoose";
import { IConcern } from "../interface/concern/IConcern";

const ConcernSchema = new Schema<IConcern>({

    bookingId:{ type:Schema.Types.ObjectId,ref:"Booking",required:true},
    userId:{type : Schema.Types.ObjectId , ref:"User",required:true},
    serviceCenterId:{type: Schema.Types.ObjectId, ref:"ServiceCenter",required:true},
    issueTittle:{type: String, required:true},
    description:{ type:String,required:true},
    proof:[{
        imageUrl:{type:String},
        videoUrl:{type:String},
        _id:false
    }],
    status:{
        type:String,
         enum: ["pending", "approved", "rejected", "scheduled", "resolved"],
         default:"pending"
    },
    providerResponse:{
        rejected:{type:Boolean,default:false},
        rejectReason:{type:String},
        responseAt:{type:Date}
    },
    resolutionBookingId: {type: Schema.Types.ObjectId,ref:"Booking"},
    timeline:[{
        status:{type:String,required:true},
        updateBy:{ type:String, required:true},
        at: {type:Date, default:Date.now},
        _id:false
    },
],
},
{timestamps: true}
)
ConcernSchema.index({ serviceCenterId:1,status:1});
ConcernSchema.index({ userId:1,createdAt:-1})

const Concern : Model<IConcern>  = mongoose.model<IConcern>("Concern",ConcernSchema);
export default Concern