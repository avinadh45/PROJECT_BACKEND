import mongoose,{Schema} from "mongoose";
import { IWallet } from "../interface/wallet/IWallet";

const walletSchema  = new Schema<IWallet>({ 

    ownerType:{
        type:String,
        enum: ["serviceCenter","platform"],
        required: true
    },
    ownerId:{
        type:Schema.Types.ObjectId,
        ref:"ServiceCenter",
        default:null
    },
    balance: {
        type:Number,
        default:0,
        min:0,

    },
    currency:{
        type:String,
        default:"INR"
    },
  
},
  { timestamps:true}
)

walletSchema.index({ ownerType: 1, ownerId:1}, { unique:true })

const Wallet = mongoose.model<IWallet>("wallet",walletSchema)
export default Wallet

