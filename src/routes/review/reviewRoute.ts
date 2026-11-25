import express from "express";
import { ReviewController } from "../../controller/review/reviewController";
import { ReviewService } from "../../service/review/reviewService";
import { ReviewRepository } from "../../repository/review/reviewRepository";
import { BookingRepository } from "../../repository/booking/BookingRepository";
import { ServiceCenterRepository } from "../../repository/ServiceCenter/serviceCenterRepository";
import { NotificationService } from "../../service/notification/NotificationService";
import { NotificationRepository } from "../../repository/notification/NotificationRepository";
import { authMiddleware } from "../../middleware/authMiddleware";
import { validate } from "../../middleware/validation";
import { createReviewSchema, updateReviewSchema } from "../../validation/reviewValidate";

const router = express.Router();

const reviewRepo = new ReviewRepository()
const bookingRepo = new BookingRepository()
const serviceCenterRepo = new ServiceCenterRepository()
const nofificationRepo = new NotificationRepository()
const notificationService = new NotificationService(nofificationRepo,nofificationRepo)
const reviewService = new ReviewService(reviewRepo,bookingRepo,serviceCenterRepo,notificationService)
const controller = new ReviewController(reviewService)

router.post("/booking/:bookingId",authMiddleware,validate(createReviewSchema),controller.createReview)
router.get("/booking/:bookingId",authMiddleware,controller.getBookingReview)
router.put("/booking/:bookingId",authMiddleware,validate(updateReviewSchema),controller.updateReview)
router.delete("/booking/:bookingId",authMiddleware,controller.deleteReview)
router.get("/garage/:serviceCenterId",authMiddleware,controller.getGarageReview)

export default router
