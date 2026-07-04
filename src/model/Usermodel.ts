    import mongoose, { Schema } from "mongoose";
    import { IUser } from "../interface/User/userinterface";

    const userSchema = new Schema<IUser>({
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:false
        },
        role:{
            type:String,
            enum: ["user", "serviceCenter", "admin", "mechanic"],
            default:"user"
        },
        phoneNumber:{
            type:String,
            default:null
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        isBlocked: {
        type: Boolean,
        default: false
        },
        resetToken: {
        type: String,
        default: null
        },

        googleId:{
    type:String,
    default:null
    },
        garageId: {
            type: Schema.Types.ObjectId,
            ref: "ServiceCenter",
            default: null
        },
        resetTokenExpiry: {
        type: Date,
        default: null
        },
        
        userProfile:{
            image:{
                type:String,
                default:""
            }
        }
    },
    {
            timestamps:true
        }
    )
    const User = mongoose.model<IUser>("User",userSchema)

    export default User