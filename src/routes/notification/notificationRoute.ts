import express from "express"
import { verifyAnyRole } from "../../middleware/verifyAnyRole";
import { NotificationController } from "../../controller/notification/notificationController";
import { NotificationRepository } from "../../repository/notification/NotificationRepository";
import { NotificationService } from "../../service/notification/NotificationService";

const router = express.Router()


const notificationRepo = new NotificationRepository()
const notificationService = new NotificationService(notificationRepo,notificationRepo)
const controller = new NotificationController(notificationService)

router.get("/",verifyAnyRole,controller.getNotification);
router.get("/unread-count",verifyAnyRole,controller.getUnreaderCount)
router.patch("/:id/read",verifyAnyRole,controller.markAsRead)
router.patch("/mark-all-read",verifyAnyRole,controller.markAllRead)

export default router