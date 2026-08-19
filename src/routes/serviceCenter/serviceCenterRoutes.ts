import express from "express"
import { ServiceCenterController } from "../../controller/serviceCenter/serviceCenterController"
import { ServiceCenterService } from "../../service/serviceCenter/serviceCenterService"
import { ServiceCenterRepository } from "../../repository/ServiceCenter/serviceCenterRepository"
import { MechanicReadRepository } from "../../repository/mechanic/mechanicReadRepository";
import { MechanicWriteRepository } from "../../repository/mechanic/mechanicWriteRepository";
import { NodeMailerService } from "../../service/mail/NodeMailerService";
import { MechanicService } from "../../service/mechanic/mechanicService";
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter";
import { CategoryRepository } from "../../repository/category/CategoryRepository";
import { Category } from "../../model/categoryModel";
import { upload } from "../../middleware/upload";
import { validate } from "../../middleware/userValidation";
import { updateAvailabilitySchema } from "../../validation/updateAvilability";
import { SlotRepository } from "../../repository/slot/slotRepository";
const router = express.Router()

const mailService = new NodeMailerService();
const repository = new ServiceCenterRepository()
const categoryRepo =  new CategoryRepository(Category)
const readRepository = new MechanicReadRepository();
const writeRepository = new MechanicWriteRepository();
const slotRepository = new SlotRepository()
const service = new ServiceCenterService(repository,mailService,categoryRepo,slotRepository)
const mechanicService = new MechanicService(readRepository,writeRepository)
const controller = new ServiceCenterController(service,mechanicService)

router.post("/register",upload.fields([{name:"garageLicense",maxCount:1},{name:"ownerIdProof",maxCount:1}]),controller.register.bind(controller))
router.post("/login",controller.login)
router.post("/forgot-password",controller.forgotPassword.bind(controller))
router.post("/reset-password",controller.resetPassword.bind(controller))
router.patch("/block/:id",controller.blockMechanic.bind(controller))
router.post("/refresh-token",controller.refreshToken)
router.get("/verification-status",verifyServiceCenter,controller.getVerificationStatus)
router.use(verifyServiceCenter)
router.post("/logout",controller.logout)
router.get("/application",controller.editVerification)
router.patch("/application",upload.fields([{name:"garageLicense",maxCount:1},{name:"ownerIdProof",maxCount:1}]),controller.updateVerification)
router.get("/services",controller.getServiceCenterWithService)
router.patch("/fee",controller.updateServiceFee)
router.post("/add-service",controller.addService)
router.get("/categories",controller.getCategories)
router.patch("/status/:serviceId",controller.toggleServiceStatus)
router.get("/profile",controller.getProfile)
router.patch("/availability",validate(updateAvailabilitySchema),controller.updateAvailability)


export default router
