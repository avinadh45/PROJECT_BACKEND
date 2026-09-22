import { Types } from "mongoose";
import Message from "../../model/messageModel";
import { IMessage } from "../../interface/Chat/IMessage";
import {
  IMessageReadRepository,
  IMessageWriteRepository,
} from "../../interface/Chat/IMessageRepository";

export class MessageRepository
  implements IMessageReadRepository, IMessageWriteRepository
{
  async findByConversation(
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const query = { conversationId: new Types.ObjectId(conversationId) };
    const data = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await Message.countDocuments(query);
    return {
      data: data.reverse(),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async countUnread(conversationId: string, userId: string): Promise<number> {
    return Message.countDocuments({
      conversationId: new Types.ObjectId(conversationId),
      senderId: { $ne: new Types.ObjectId(userId) },
      "readBy.userId": { $ne: new Types.ObjectId(userId) },
    });
  }

  async create(data: Partial<IMessage>): Promise<IMessage> {
    return Message.create(data);
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await Message.updateMany({
      conversationId: new Types.ObjectId(conversationId),
      senderId: { $ne: new Types.ObjectId(userId) },
      "readBy.userId": { $ne: new Types.ObjectId(userId) },
    },
    {$push:{readBy:{ userId: new Types.ObjectId(userId),readAt: new Date()}}}
);
  }
}
