import { NotificationRepository } from "../../repository/notification/NotificationRepository";
import { NotificationResponseDTO } from "../../dto/notification/notificationDTO";
import { NotificationType, RecipientRole,ReferenceType } from "./INotification";
import { NotifyParams } from "./INotification";

export interface INotificationService{

    notify(params:NotifyParams):Promise<void>
      getForRecipient(recipientId: string, page: number, limit: number): Promise<{ items: NotificationResponseDTO[]; total: number }>;
    getUnreadCount(recipientId:string):Promise<number>
 markAsRead(id: string, recipientId: string): Promise<NotificationResponseDTO | null>;
 markAllAsRead(recipientId: string):Promise<void>
}