import { BaseRepository } from "../base/BaseRepository";
import { NotificationModel } from "../../model/notificationModel";
import { INotification } from "../../interface/Notification/INotification";
import {
  INotificationReadRepository,
  INotificationWriteRepository,
} from "../../interface/Notification/INotificationRepository";

export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationReadRepository, INotificationWriteRepository
{
  constructor() {
    super(NotificationModel);
  }

  async findByRecipien(
    recipientId: string,
    page: number,
    limit: number,
  ): Promise<{ items: INotification[]; total: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      NotificationModel.find({ recipientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      NotificationModel.countDocuments({ recipientId }),
    ]);
    return { items, total };
  }

  async countUnread(recipientId: string): Promise<number> {
    return NotificationModel.countDocuments({ recipientId, isRead: false });
  }

  async create(data: Partial<INotification>): Promise<INotification> {
    return NotificationModel.create({ ...data, isRead: false });
  }

  async markAsRead(
    id: string,
    recipientId: string,
  ): Promise<INotification | null> {
    return NotificationModel.findOneAndUpdate(
      { _id: id, recipientId },
      { isRead: true },
      { new: true },
    ).lean();
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await NotificationModel.updateMany(
      { recipientId, isRead: false },
      { isRead: true },
    );
  }
}
