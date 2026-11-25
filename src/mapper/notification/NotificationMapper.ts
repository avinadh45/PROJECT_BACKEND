import { INotification } from "../../interface/Notification/INotification";
import { NotificationResponseDTO } from "../../dto/notification/notificationDTO";

export class NotificationMapper{

    static toResponseDTO(doc:INotification & {_id:any}):NotificationResponseDTO{

        return{
            id:doc._id.toString(),
            type: doc.type,
            title: doc.title,
            message: doc.message,
            referenceId:doc.recipientId,
            referenceType:doc.referenceType,
            isRead:doc.isRead,
            createdAt:doc.createdAt!,
        }
    }
}