import mongoose, { Schema, Model } from "mongoose";
import { IConversation } from "../interface/Chat/IConversation";

const ConversationSchema = new Schema<IConversation>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    concernId: { type: Schema.Types.ObjectId, ref: "Concern" },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, required: true },
        role: {
          type: String,
          enum: ["user", "serviceCenter", "mechanic"],
          required: true,
        },
        _id: false,
      },
    ],
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String },
  },
  { timestamps: true },
);

ConversationSchema.index({bookingId:1},{ sparse: true });
ConversationSchema.index({ concernId: 1 },{ sparse: true })

const Conversation: Model<IConversation> = mongoose.model<IConversation>("Conversation",ConversationSchema)
export default Conversation