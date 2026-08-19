import Razorpay from "razorpay"

let _instance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (!_instance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials missing in environment variables");
    }
    _instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _instance;
}