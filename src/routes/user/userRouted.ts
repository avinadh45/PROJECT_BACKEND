import { Router } from "express";
import { UserService } from "../../service/user/userservice";
import { UserController } from "../../controller/user/userController";
import { UserRepository } from "../../repository/userRepository";
import { RedisOtpRepository } from "../../repository/otp/RedisOtpRepository";
import { NodeMailerService } from "../../service/mail/NodeMailerService";
import { validate } from "../../middleware/userValidation";
import { registerSchema } from "../../validation/userValidation";
import { checkBlocked } from "../../middleware/checkBlock";
import { authMiddleware } from "../../middleware/authMiddleware";
import User from "../../model/Usermodel";
import { BookingService } from "../../service/booking/bookingService";
import { ServiceCenterRepository } from "../../repository/ServiceCenter/serviceCenterRepository";
import { BookingRepository } from "../../repository/booking/BookingRepository";
import { SlotRepository } from "../../repository/slot/slotRepository";
import { MechanicReadRepository } from "../../repository/mechanic/mechanicReadRepository";
import { BookingController } from "../../controller/booking/bookingController";
const router = Router()

const userRepository = new UserRepository(User);
const otpRepository = new RedisOtpRepository();
const mailService = new NodeMailerService();
const serviceCenterRepo = new ServiceCenterRepository()
const bookingRepo = new BookingRepository()
const slotRepo = new SlotRepository()
const mechanicRepo = new MechanicReadRepository()
const bookingService = new BookingService(serviceCenterRepo,bookingRepo,slotRepo,mechanicRepo)
const bookingController = new BookingController(bookingService)


const userService = new UserService(
    userRepository, 
    otpRepository,
    mailService
)
const userController = new UserController(userService)

router.post("/register",validate(registerSchema),userController.registerUser)
router.post("/verify-otp",userController.Verifyotp.bind(userController))
router.post("/login",userController.LoginUser.bind(userController))
router.post("/refresh-token",userController.refresnToken.bind(userController))
router.post("/resend-otp",userController.resendOtp.bind(userController))
router.post("/forgot-password",userController.forgetPassword.bind(userController))
router.get("/dashboard",authMiddleware,userController.getdashboard)
router.post("/reset-password",userController.resetPassword.bind(userController))
router.post("/google-login",userController.googleLogin.bind(userController))
router.post("/logout",userController.logout.bind(userController))
router.get("/my-bookings",authMiddleware,bookingController.getUserBooking)
router.get("/details/:bookingId",authMiddleware,bookingController.getUserBookingDetails)
router.patch("/booking/:bookingId/cancel",authMiddleware,bookingController.cancelBooking)
router.patch("/booking/:bookingId/reschedule",authMiddleware,bookingController.rescheduleBooking)

export default router
