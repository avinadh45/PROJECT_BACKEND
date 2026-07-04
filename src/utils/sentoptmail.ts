import nodemailer from "nodemailer"

export const sendOtpMail = async(email:string,otp:string)=>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    })
    await transporter.sendMail({
        from:process.env.EMAIL,
        to:email,
        subject:"Your OTP Verification Code",
        text: `Your OTP is: ${otp}`
    })
}