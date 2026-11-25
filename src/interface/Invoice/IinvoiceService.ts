import { InvoiceResponseDTO,ServiceCenterInvoiceResponseDTO } from "../../dto/invoice/invoiceDTO";

export interface IInvoiceService{

    generateInvoice(bookingId:string, serviceCenterId:string): Promise<ServiceCenterInvoiceResponseDTO>
    getInvoiceForUser(bookingId:string,userId: string):Promise<InvoiceResponseDTO>
    getInvoiceForServiceCenter(bookingId:string,serviceCenterId:string):Promise<ServiceCenterInvoiceResponseDTO>
    createPaymentOrder(invoiceId:string,userId:string):Promise<{ orderId:string, amount:number, currency:string}>
    verifyPayment(invoiceId:string,razorpayOrderId:string,razorpayPaymentId:string, razorpaySignature:string,):Promise<InvoiceResponseDTO>
}

