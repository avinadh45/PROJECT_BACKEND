import express from "express"
import { subscriptionController } from "../../controller/subscription/subscriptionController"
import { SubscriptionService } from "../../service/subscription/subscriptionService"
import { SubscriptionRepository } from "../../repository/subscription/SubscriptionReposiotry"
import { adminMiddleware } from "../../middleware/verifyAdmin"
import { subscribeToPlanSchema, updateSubscriptionSchema } from "../../validation/subscriptionValidation"
import { ServiceCenterRepository } from "../../repository/ServiceCenter/serviceCenterRepository"
import { validate } from "../../middleware/userValidation"
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter"

const router = express.Router()

const subscriptionRepository = new SubscriptionRepository()
const serviceCenterRepository = new ServiceCenterRepository()
const subscriptionService = new SubscriptionService(subscriptionRepository,subscriptionRepository,subscriptionRepository,serviceCenterRepository, )
const controller = new subscriptionController(subscriptionService)

router.post("/add",adminMiddleware,controller.createSubscription)
router.get("/list",adminMiddleware,controller.listSubscription)
router.patch("/:id",adminMiddleware,validate(updateSubscriptionSchema),controller.updateSubscription)
router.delete("/:id",adminMiddleware,controller.deleteSubscription)


router.get("/status",verifyServiceCenter,controller.getSubscription)
router.get("/plans",verifyServiceCenter,controller.listSubscription)
router.post("/subscribe",verifyServiceCenter,validate(subscribeToPlanSchema),controller.subscribeToPlane)
router.post("/create-order",verifyServiceCenter,controller.createPaymentOrder)
router.post("/verify-payment",verifyServiceCenter,controller.verifyPaymentAndSubscription)

export default router
