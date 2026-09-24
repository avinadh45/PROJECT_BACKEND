import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware, AuthenticatedSocket } from "./socketAuth";
import { ChatService } from "../service/chat/ChatService";
import { ConversationRepository } from "../repository/chat/ConversationRepository";
import { MessageRepository } from "../repository/chat/MessageRepository";
import { BookingRepository } from "../repository/booking/BookingRepository";
import { ConcernRepository } from "../repository/concern/ConcernRepository";

const ConversationRepo = new ConversationRepository();
const messageRepo = new MessageRepository();
const bookingRepo = new BookingRepository();
const concernRepo = new ConcernRepository();

const chatService = new ChatService(
  ConversationRepo,
  bookingRepo,
  concernRepo,
  messageRepo,
);

let io: Server;

export function initSocketServer(httpServer: HTTPServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  io.use(socketAuthMiddleware);
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.userRole}:${socket.userId}`);

    socket.join(`${socket.userRole}:${socket.userId}`);
    socket.on(
      "chat:join",
      async ({
        bookingId,
        concernId,
      }: {
        bookingId?: string;
        concernId?: string;
      }) => {
         console.log("chat:join payload received:", { bookingId, concernId }); 
        try {
          let conversationId: string;
          if (bookingId) {
            conversationId = await chatService.getOrCreateBookingConversation(
              bookingId,
              socket.userId!,
              socket.userRole!,
            );
          } else if (concernId) {
            conversationId = await chatService.getOrCreateConcernConversation(
              concernId,
              socket.userId!,
              socket.userRole!,
            );
          } else {
            return socket.emit("chat:error", {
              message: "bookingId or concernId required",
            });
          }
          socket.join(`chat:${conversationId}`);
          socket.emit("chat:joined", { conversationId });
        } catch (err: any) {
          socket.emit("chat:error", {
            message: err.message ?? "Could not join chat",
          });
        }
      },);
    socket.on("chat:send",async({conversationId,text,type}:{conversationId: string;text:string;type?:"text"|"image"})=>{
      try {
        const message = await chatService.sendMessage(conversationId,socket.userId!, socket.userRole!,{text,type})
        io.to(`chat:${conversationId}`).emit("chat:message",message)
      } catch (err:any) {
        socket.emit("chat:error",{message:err.message ?? "Could not send message"})
      }
    })
    socket.on(
      "chat:markRead",
      async ({ conversationId }: { conversationId: string }) => {
        try {
          await chatService.markConversationRead(
            conversationId,
            socket.userId!,
          );
          socket
            .to(`chat:${conversationId}`)
            .emit("chat:read", { conversationId, userId: socket.userId });
        } catch (error) {}
      },
    );
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.userRole}:${socket.userId}`);
    });
  });
  return io;
}
export function emitToUser(
  userId: string,
  role: string,
  event: string,
  payload: any,
) {
  if (!io) return;
  io.to(`${role}:${userId}`).emit(event, payload);
}
