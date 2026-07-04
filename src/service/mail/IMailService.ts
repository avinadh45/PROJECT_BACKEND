export interface IMailService {
    sendOtpMail(email: string, otp: string): Promise<void>;
    sendResetPasseord(email:string,resetLink: string): Promise<void>
}
