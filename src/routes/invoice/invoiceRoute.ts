import express from "express"
import { InvoiceController } from "../../controller/invoice/InvoiceController"
import { InvoiceService } from "../../service/invoice/InvoiceService"
import { InvoiceRepository } from "../../repository/invoice/IInvoiceRepository"
import { BookingRepository } from "../../repository/booking/BookingRepository"
import { NotificationService } from "../../service/notification/NotificationService"
import { NotificationRepository } from "../../repository/notification/NotificationRepository"
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter"
import { authMiddleware } from "../../middleware/authMiddleware"
import { verifyAnyRole } from "../../middleware/verifyAnyRole"
import { WalletRepository } from "../../repository/wallet/walletRepository"
import { WalletService } from "../../service/wallet/walletService"


const router = express.Router()

const invoiceRepo = new InvoiceRepository()
const bookingRepo = new BookingRepository()
const notificationRepo = new NotificationRepository()
const walletRepo = new WalletRepository() 
const walletService  = new WalletService(walletRepo)
const notificationService = new NotificationService(notificationRepo,notificationRepo)
const invoiceService = new InvoiceService(invoiceRepo,bookingRepo,notificationService,walletService)
const controller =  new InvoiceController( invoiceService)

router.post("/generate/:bookingId",verifyServiceCenter,controller.generateInvoice)
router.get("/service-center/:bookingId",verifyServiceCenter,controller.getInvoiceForServiceCenter)
router.get("/:bookingId",authMiddleware,controller.getInvoiceForUser)
router.post("/:invoiceId/pay",authMiddleware,controller.createPaymentOrder)
router.post("/:invoiceId/verify-payment",authMiddleware,controller.verifyPayment)

export default router