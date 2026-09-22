import mongoose, { Schema, Model } from "mongoose";
import { IMessage } from "../interface/Chat/IMessage";

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderRole: {
      type: String,
      enum: ["user", "serviceCenter", "mechanic"],
      required: true,
    },
    text: { type: String, required: true },
    types: { type: String, enum: ["text", "image", "system"], default: "text" },

    readBy: [
      {
        userId: { type: Schema.Types.ObjectId, required: true },
        readAt: { type: Date, required: true },
        _id: false,
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });
const Message: Model<IMessage> = mongoose.model<IMessage>(
  "Message",
  MessageSchema,
);
export default Message;
