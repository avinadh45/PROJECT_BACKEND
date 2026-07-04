import nodemailer from "nodemailer"

export const sendResetPassword = async(email:string,resetLink:string)=>{

    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to : email, 
     subject: "Reset Your Password",
    text: `Click this link to reset your password: ${resetLink}`
  })
}