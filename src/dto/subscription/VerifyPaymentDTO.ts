export interface VerifyPaymentDTO{
    razorpay_order_id:string;
    razorpay_payment_id:string;
    razorpay_signature:string;
    subscriptionId:string;
    durationMonths:number;
}