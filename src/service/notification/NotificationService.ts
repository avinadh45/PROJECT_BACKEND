import { Server } from "socket.io";

import { INotificationReadRepository,INotificationWriteRepository } from "../../interface/Notification/INotificationRepository";
import { INotificationService, } from "../../interface/Notification/INotificationService";
import { NotifyParams } from "../../interface/Notification/INotification";
import { NotificationMapper } from "../../mapper/notification/NotificationMapper";
import { emitToUser } from "../../socket/sindex";
import { NotificationResponseDTO } from "../../dto/notification/notificationDTO";

export class NotificationService implements INotificationService {

    constructor(private _readRepo:INotificationReadRepository,private _writeRepo : INotificationWriteRepository,){}

    async notify(params: NotifyParams): Promise<void> {
        
        const notification = await this._writeRepo.create(params)
        const dto = NotificationMapper.toResponseDTO(notification as any)
        emitToUser(params.recipientId,params.recipientRole,"notification:new",dto)
    }
    
    async getForRecipient(recipientId: string, page: number, limit: number): Promise<{ items: NotificationResponseDTO[]; total: number; }> {
        const { items, total} = await this._readRepo.findByRecipien(recipientId,page,limit)
        return { items: items.map((n)=> NotificationMapper.toResponseDTO( n as any)),total}
    }

    async getUnreadCount(recipientId: string): Promise<number> {
        return this._readRepo.countUnread(recipientId)
    }

    async markAsRead(id: string, recipientId: string): Promise<NotificationResponseDTO | null> {
        const updated = await this._writeRepo.markAsRead(id,recipientId)
        return updated ? NotificationMapper.toResponseDTO(updated as any):null
    }

    async markAllAsRead(recipientId: string): Promise<void> {
        await this._writeRepo.markAllAsRead(recipientId)
    }
}