import express from "express";
import { MechanicController } from "../../controller/mechanic/mechanic";
import { MechanicService } from "../../service/mechanic/mechanicService";
import { MechanicReadRepository } from "../../repository/mechanic/mechanicReadRepository";
import { MechanicWriteRepository } from "../../repository/mechanic/mechanicWriteRepository";
import { verifyMechanic } from "../../middleware/verifyMechanic";
import { verifyServiceCenter } from "../../middleware/verifyserviceCenter";
import { BookingRepository } from "../../repository/booking/BookingRepository";
import { BookingService } from "../../service/booking/bookingService";
import { BookingController } from "../../controller/booking/bookingController";
import { SlotRepository } from "../../repository/slot/slotRepository";
import { ServiceCenterRepository } from "../../repository/ServiceCenter/serviceCenterRepository";
import { upload } from "../../middleware/upload";

const router = express.Router();

const readRepository = new MechanicReadRepository();
const writeRepository = new MechanicWriteRepository();
const bookingRepo = new BookingRepository()
const slotRepo = new SlotRepository()
const serviceCenterRepo = new ServiceCenterRepository()
const bookingService = new BookingService(serviceCenterRepo,bookingRepo,slotRepo,readRepository)
const bookingController = new BookingController(bookingService)
const service = new MechanicService(readRepository, writeRepository);
const controller = new MechanicController(service);

router.post("/create",  verifyServiceCenter, controller.createMechanic.bind(controller));
router.post("/login", controller.loginMechanic.bind(controller));
router.get('/list',verifyServiceCenter,controller.getMechanic.bind(controller))
router.get('/dashboard',verifyMechanic,controller.getDashboard)
router.get("/bookings",verifyMechanic,bookingController.getMechanicBooking)
router.get("/bookings/:bookingId",verifyMechanic,bookingController.getBookingInMechanic)
router.patch("/bookings/:bookingId/job",verifyMechanic,bookingController.updateMechanicJob)
router.patch("/bookings/:bookingId/status",verifyMechanic,bookingController.updateStatus)
router.patch("/bookings/:bookingId/proof",verifyMechanic,upload.single("proofImage"),bookingController.uploadProof)

export default router;
