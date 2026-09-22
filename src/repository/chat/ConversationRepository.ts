import { Types } from "mongoose";
import Conversation from "../../model/conversationModel";
import { IConversation } from "../../interface/Chat/IConversation";
import { IConversationReadRepository,IConversationWriteRepository } from "../../interface/Chat/IConversationRepository";


export class ConversationRepository implements IConversationReadRepository,IConversationWriteRepository{

    async findById(conversationId: string): Promise<IConversation | null> {
        return Conversation.findById(conversationId)
    }

    async findByConcernId(concernId: string): Promise<IConversation | null> {
        return Conversation.findOne({ concernId: new Types.ObjectId(concernId) })
    }
    async findByBookingId(bookingId: string): Promise<IConversation | null> {
        return Conversation.findOne({ bookingId: new Types.ObjectId(bookingId)})
    }
    async findByParticipant(userId: string, page: number, limit: number): Promise<any> {
        
        const skip = ( page - 1)*limit 
        const query = { "participants.userId" : new Types.ObjectId(userId)}
        const data = await Conversation.find(query).sort({lastMessageAt:-1,createdAt: -1}).skip(skip).limit(limit)
        const total = await Conversation.countDocuments(query)

        return { data,total,page,limit,totalPages: Math.max(1, Math.ceil(total / limit)) }
    }
    async create(data: Partial<IConversation>): Promise<IConversation> {
        return Conversation.create(data)
    }
    async updateLastMessage(conversationId: string, preview: string, at: Date): Promise<void> {
        
        await Conversation.updateOne({ _id: conversationId },{$set:{lastMessagePreview: preview, lastMessageAt: at}})
    }
}