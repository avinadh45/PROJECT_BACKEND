import { IMailService } from "./IMailService";
import { sendOtpMail } from "../../utils/sentoptmail";
import { sendResetPassword } from "../../utils/sendResetPasswordMail";

export class NodeMailerService implements IMailService {
    async sendOtpMail(email: string, otp: string): Promise<void> {
        await sendOtpMail(email, otp);
    }
    async sendResetPasseord(email: string, resetLink: string): Promise<void> {
        await sendResetPassword(email,resetLink)
    }
}
