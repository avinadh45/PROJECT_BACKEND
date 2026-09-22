import { Types } from "mongoose";
import { ChatParticipantRole } from "./IConversation";

export type MessageType = "text" | "image" | "system";

export interface IMessageReadReceipt{

    userId:Types.ObjectId;
    readAt:Date 
}

export interface IMessage{

    _id:Types.ObjectId;
    conversationId:Types.ObjectId;
    senderId:Types.ObjectId;
    senderRole:ChatParticipantRole;
    text:string;
    types:MessageType;
    readBy:IMessageReadReceipt[];
    createdAt?:Date
}