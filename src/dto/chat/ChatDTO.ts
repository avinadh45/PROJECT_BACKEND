export interface SendMessageDTO {
  text: string;
  type?: "text" | "image";
}

export interface MessageResponseDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "user" | "serviceCenter" | "mechanic";
  text: string;
  type: "text" | "image" | "system";
  createdAt: Date;
}

export interface ConversationSummaryDTO {
  id: string;
  bookingId?: string;
  concernId?: string;
  otherParticipantName: string;
  lastMessagePreview: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
}