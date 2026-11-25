import { Schema,model } from 'mongoose'
import { INotification } from '../interface/Notification/INotification'

const notificationSchema = new Schema<INotification>({

    recipientId:{ type:String, required:true, index:true},
    recipientRole: { type: String, enum: ["user", "serviceCenter", "mechanic"], required: true },
    type: { type: String, enum: ["booking_status", "concern_status", "reschedule", "cancellation", "refund"], required: true },
    title: { type:String, required:true },
    message: { type: String, required: true },
    referenceId: { type:String, required: true},
     referenceType: { type: String, enum: ["booking", "concern"], required: true },
     isRead: { type:Boolean, default: false, index:true}
},
{timestamps:{createdAt:true,updatedAt:false}}
)

notificationSchema.index({ recipientId: 1,  createdAt: -1})

export const NotificationModel = model<INotification>("Notification",notificationSchema)