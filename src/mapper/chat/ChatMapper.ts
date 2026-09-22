import { IMessage } from "../../interface/Chat/IMessage";
import { MessageResponseDTO } from "../../dto/chat/ChatDTO";
export class ChatMapper {
  static toMessageResponseDTO(msg: IMessage): MessageResponseDTO {
    return {
      id: msg._id.toString(),
      conversationId: msg.conversationId.toString(),
      senderId: msg.senderId.toString(),
      senderRole: msg.senderRole,
      text: msg.text,
      type: msg.types,
      createdAt: msg.createdAt!,
    };
  }
}