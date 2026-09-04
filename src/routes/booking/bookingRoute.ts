import express from "express"
import { BookingController } from "../../controller/booking/bookingController"
import { BookingService } from "../../service/booking/bookingService"
import { ServiceCenterRepository } from "../../repository/ServiceCenter/serviceCenterRepository"
import { CategoryController } from "../../controller/category/categoryController"
import { CategoryService } from "../../service/category/categoryService"
import { CategoryRepository } from "../../repository/category/CategoryRepository"
import { Category} from "../../model/categoryModel"
import { authMiddleware } from "../../middleware/authMiddleware"
import { SlotController } from "../../controller/slot/slotController"
import { SlotRepository } from "../../repository/slot/slotRepository"
import { SlotService } from "../../service/slot/slotService"
import { BookingRepository } from "../../repository/booking/BookingRepository"
import { MechanicReadRepository } from "../../repository/mechanic/mechanicReadRepository"



const router = express.Router()
const repo = new CategoryRepository(Category)
const serviceCenterRepo = new ServiceCenterRepository()
const bookingRepo = new BookingRepository()
const mechRepo  = new MechanicReadRepository()
const slotRepo = new SlotRepository()
const slotService = new SlotService(slotRepo,slotRepo,serviceCenterRepo)
const slotController = new SlotController(slotService)
const bookingService = new BookingService(serviceCenterRepo,bookingRepo,slotRepo,mechRepo)
const controller = new BookingController(bookingService)
const categoryService  = new CategoryService(repo,repo)
const categoryController = new CategoryController(categoryService)

router.get("/garages",controller.findAvailableServiceCenter)
router.get("/categories",categoryController.getCategory)
router.get("/:serviceCenterId/slots",authMiddleware,slotController.getAvailableSlots)
router.post("/create-order",authMiddleware,controller.createOrder)
router.post("/verify-payment",authMiddleware, controller.verifyPayment)
router.get("/:bookingId",authMiddleware,controller.getBooking)




export default router