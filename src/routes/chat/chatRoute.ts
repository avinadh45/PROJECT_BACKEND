import express from "express" 
import { ChatController } from "../../controller/chat/chatController"
import { ChatService } from "../../service/chat/ChatService"
import { ConversationRepository } from "../../repository/chat/ConversationRepository"
import { MessageRepository } from "../../repository/chat/MessageRepository"
import { BookingRepository } from "../../repository/booking/BookingRepository"
import { ConcernRepository } from "../../repository/concern/ConcernRepository"
import { authMiddleware } from "../../middleware/authMiddleware"
import { verifyMechanic } from "../../middleware/verifyMechanic"
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter"
import { verifyAnyRole } from "../../middleware/verifyAnyRole"

const router = express.Router()

const conversationRepo = new ConversationRepository()
const messageRepo = new MessageRepository()
const bookingRepo = new BookingRepository()
const concernRepo = new ConcernRepository()
const chatservice = new ChatService(conversationRepo,bookingRepo,concernRepo,messageRepo)
const controller = new ChatController(chatservice) 


router.get("/:conversationId/messages",verifyAnyRole,controller.getMessage)
export default router