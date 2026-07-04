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

const router = Router()

const userRepository = new UserRepository(User);
const otpRepository = new RedisOtpRepository();
const mailService = new NodeMailerService();

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

export default router