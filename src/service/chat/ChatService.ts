import { IChatService } from "../../interface/Chat/IChatService";
import {
  IConversationReadRepository,
  IConversationWriteRepository,
} from "../../interface/Chat/IConversationRepository";
import { IBookkingReadRepository } from "../../interface/Booking/IBookingRepository";
import { AppError } from "../../utils/AppError";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { Types } from "mongoose";
import { IConcernReadRepository } from "../../interface/concern/IConcernRepository";
import { SendMessageDTO, MessageResponseDTO } from "../../dto/chat/ChatDTO";
import { IMessageWriteRepository,IMessageReadRepository } from "../../interface/Chat/IMessageRepository";
import { ChatMapper } from "../../mapper/chat/ChatMapper";


export class ChatService implements IChatService {
  constructor(
    private _conversationRepo: IConversationReadRepository &
      IConversationWriteRepository,
    private _bookingRepo: IBookkingReadRepository,
    private _concernRepo: IConcernReadRepository,
    private _messageRepo: IMessageWriteRepository & IMessageReadRepository,
  ) {}

  async getOrCreateBookingConversation(
    bookingId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<string> {
    const booking = await this._bookingRepo.findById(bookingId);
    if (!booking) {
      throw new AppError(MESSAGES.CHAT.NOT_AVAILABLE, HttpStatus.BAD_REQUEST);
    }
    if (!booking.mechanicId) {
      throw new AppError(MESSAGES.CHAT.NOT_AVAILABLE, HttpStatus.BAD_REQUEST);
    }
    const isUser =
      requesterRole === "user" && booking.userId.toString() === requesterId;
    const isMechanic =
      requesterRole === "mechanic" &&
      booking.mechanicId.toString() === requesterId;

    if (!isUser && !isMechanic) {
      throw new AppError(MESSAGES.COMMON.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const existing = await this._conversationRepo.findByBookingId(bookingId);
    if (existing) return existing._id.toString();

    const conversation = await this._conversationRepo.create({
      bookingId: new Types.ObjectId(bookingId),
      participants: [
        { userId: booking.userId, role: "user" },
        { userId: booking.mechanicId, role: "mechanic" },
      ],
    });
    return conversation._id.toString();
  }

  async getOrCreateConcernConversation(
    concernId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<string> {
    const concern = await this._concernRepo.findById(concernId);
    if (!concern) {
      throw new AppError(MESSAGES.COMMON.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const isUser =
      requesterRole === "user" && concern.userId.toString() === requesterId;
    const isServiceCenter =
      requesterRole === "serviceCenter" &&
      concern.serviceCenterId.toString() === requesterId;

    if (!isUser && !isServiceCenter) {
      throw new AppError(MESSAGES.COMMON.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    const existing = await this._conversationRepo.findByConcernId(concernId);
    if (existing) return existing._id.toString();

    const conversation = await this._conversationRepo.create({
      concernId: new Types.ObjectId(concernId),
      participants: [
        { userId: concern.userId, role: "user" },
        { userId: concern.serviceCenterId, role: "serviceCenter" },
      ],
    });
    return conversation._id.toString();
  }
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderRole: string,
    dto: SendMessageDTO,
  ): Promise<MessageResponseDTO> {
    const conversation = await this._conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new AppError(MESSAGES.COMMON.NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === senderId,
    );
    if (!isParticipant) {
      throw new AppError(MESSAGES.COMMON.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const message = await this._messageRepo.create({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(senderId),
      senderRole: senderRole as any,
      text: dto.text,
      types: dto.type ?? "text",
      readBy: [{ userId: new Types.ObjectId(senderId), readAt: new Date() }],
    });
    await this._conversationRepo.updateLastMessage(
      conversationId,
      dto.text.slice(0, 100),
      new Date(),
    );
    return ChatMapper.toMessageResponseDTO(message);
  }

  async getMessage(
    conversationId: string,
    userId: string,
    page: number,
    limit: number,
  ): Promise<any> {
    const conversation = await this._conversationRepo.findById(conversationId);
    if (!conversation)
      throw new AppError(MESSAGES.COMMON.NOT_FOUND, HttpStatus.NOT_FOUND);

    const isParticipant = conversation.participants.some(
      (p) => p.userId.toString() === userId,
    );
    if (!isParticipant)
      throw new AppError(MESSAGES.COMMON.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    const result = await this._messageRepo.findByConversation(conversationId,page,limit)
    return { ...result,data:result.data.map(ChatMapper.toMessageResponseDTO)}
  }

  async markConversationRead(conversationId: string, userId: string): Promise<void> {
      await this._messageRepo.markAsRead(conversationId,userId)
  }
}
