import { Types } from "mongoose";

export type ChatParticipantRole = "user" | "serviceCenter" | "mechanic";

export interface IChatParticipant {
  userId: Types.ObjectId;
  role: ChatParticipantRole;
}

export interface IConversation {
  _id: Types.ObjectId;
  bookingId?: Types.ObjectId;
  concernId?: Types.ObjectId;
  participants: IChatParticipant[];
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
