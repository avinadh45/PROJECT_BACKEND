import { SendMessageDTO,MessageResponseDTO,ConversationSummaryDTO } from "../../dto/chat/ChatDTO";

export interface IChatService { 

    getOrCreateBookingConversation(bookingId:string, requesterId: string, requesterRole: string):Promise<string>
    getOrCreateConcernConversation(concernId:string, requesterId: string, requesterRole:string): Promise<string>
    sendMessage(conversationId:string, senderId:string, senderRole:string, dto:SendMessageDTO):Promise<MessageResponseDTO>
    getMessage(conversationId:string, userId:string, page:number, limit:number):Promise<any>
    markConversationRead(conversationId:string,userId:string):Promise<void>
    
}