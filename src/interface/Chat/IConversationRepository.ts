import { IConversation } from "./IConversation";

export interface IConversationReadRepository {
  findById(conversationId: string): Promise<IConversation | null>;
  findByBookingId(bookingId: string): Promise<IConversation | null>;
  findByConcernId(concernId: string): Promise<IConversation | null>;
  findByParticipant(userId: string, page: number, limit: number): Promise<any>;
}

export interface IConversationWriteRepository {
  create(data: Partial<IConversation>): Promise<IConversation>;
  updateLastMessage(
    conversationId: string,
    preview: string,
    at: Date,
  ): Promise<void>;
}
