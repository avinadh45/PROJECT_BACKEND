import express from "express";
import { ConcernService } from "../../service/concern/concernService";
import { ConcernController } from "../../controller/concern/concernController";
import { ConcernRepository } from "../../repository/concern/ConcernRepository";
import { BookingRepository } from "../../repository/booking/BookingRepository";
import { authMiddleware } from "../../middleware/authMiddleware";
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter";
import { upload } from "../../middleware/upload";

const router = express.Router()
const ConcernReadRepo = new ConcernRepository()
const BookingRepo = new BookingRepository()
const concernService = new ConcernService(ConcernReadRepo,BookingRepo)
const controller = new ConcernController(concernService)

router.post("/create-concern",upload.fields([{name:"image",maxCount:1},{name:"video",maxCount:1}]),authMiddleware,controller.createConcern)
router.get("/concern-list",verifyServiceCenter,controller.getServiceCenterConcerns)
router.get("/concern-detail/:concernId",verifyServiceCenter,controller.getDetails)
router.patch("/:concernId/respond",verifyServiceCenter,controller.respondToConcern)

export default router
