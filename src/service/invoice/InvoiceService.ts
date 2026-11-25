import crypto from "crypto";
import { getRazorpayInstance } from "../../utils/razorpay";
import { IInvoiceService } from "../../interface/Invoice/IinvoiceService";
import { IInoiceReadRepository, IInvoiceWriteRepository } from "../../interface/Invoice/IinvoiceRepository";
import { IBookingWriteRepository, IBookkingReadRepository } from "../../interface/Booking/IBookingRepository";
import { INotificationService } from "../../interface/Notification/INotificationService";
import { ServiceCenterInvoiceResponseDTO } from "../../dto/invoice/invoiceDTO";
import { IWalletService } from "../../interface/wallet/IWalletService";
import { AppError } from "../../utils/AppError";
import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { InvoiceMapper } from "../../mapper/invoice/invoiceMapper";
import { InvoiceResponseDTO } from "../../dto/invoice/invoiceDTO";
import { logger } from "../../config/logger";
import { calcPlatformFee } from "../../utils/platformFee";

export class InvoiceService implements IInvoiceService {

    constructor(private _invoiceRepo : IInoiceReadRepository & IInvoiceWriteRepository,
                private _bookingRepo: IBookingWriteRepository & IBookkingReadRepository,
                private _notificationService : INotificationService,
                private _walletService: IWalletService ) {}
                
    async generateInvoice(bookingId: string, serviceCenterId: string): Promise<ServiceCenterInvoiceResponseDTO> {

        const PLATFORM_FEE_PERCENTAGE = 10;

        const existing = await this._invoiceRepo.findByBookingId(bookingId)
        if(existing){
            throw new AppError(MESSAGES.INVOICE.ALREADY_EXIST,HttpStatus.BAD_REQUEST)
        }
        const booking = await this._bookingRepo.findById(bookingId)
        if(!booking){
            throw new AppError(MESSAGES.BOOKING.NOT_FOUND,HttpStatus.NOT_FOUND)
        }
        if(booking.status !== "completed"){
            throw new AppError(MESSAGES.INVOICE.BOOKING_NOT_COMPLETED,HttpStatus.BAD_REQUEST)
        }
        if(booking.serviceCenterId.toString() !== serviceCenterId){
            throw new AppError(MESSAGES.COMMON.UNAUTHORIZED,HttpStatus.UNAUTHORIZED)
        }
        if(!booking.job  || booking.job.description.length === 0){
            throw new AppError(MESSAGES.INVOICE.NO_OB_DATA,HttpStatus.BAD_REQUEST)
        }

        const items = booking.job!.description.map((a:any)=>({
            description: a.issueFound,
            sparePart: a.spareParts,
             quantity: a.sparePartQty,
             cost:a.initalCost
        }))
        
        const subtotal = items.reduce((sum:number,i:any)=> sum + i.cost * i.quantity,0)

        const platformFeeAmount = calcPlatformFee(subtotal)
        const advancePaid = booking.advancePayment?.amount ?? 0
        const balanceDue = Math.max(subtotal - advancePaid,0) 

        const serviceCenterPayout = subtotal - platformFeeAmount;

        const invoice = await this._invoiceRepo.create({
            bookingId:booking._id,
            userId : booking.userId,
            serviceCenterId : booking.serviceCenterId,
            mechanicId: booking.mechanicId,
            items,
            subtotal,
            advancePaid,
            balanceDue,
            platformFeePercentage: PLATFORM_FEE_PERCENTAGE,
            platformFeeAmount,
            serviceCenterPayout,
            paymentStatus:"pending",
            generatedBy:serviceCenterId
        } as any)
        await this._notificationService.notify({
            recipientId: booking.userId.toString(),
            recipientRole: "user",
            type:"booking_status",
            title:"Invoice generated",
            message:`Your invoice is ready — balance due: ₹${balanceDue}`,
            referenceId: booking._id.toString(),
            referenceType:"booking"
        })
        return  InvoiceMapper.toServiceCenterDTO( invoice as any)
    }   

     async getInvoiceForUser(bookingId: string, userId: string): Promise<InvoiceResponseDTO> {
        
        const invoice = await this._invoiceRepo.findByBookingId(bookingId)
        if(!invoice){
            throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)
        }
        if(invoice.userId.toString() !== userId){
            throw new AppError(MESSAGES.COMMON.UNAUTHORIZED,HttpStatus.UNAUTHORIZED)
        }
        return InvoiceMapper.toUserDTO( invoice as any)
    }

    async getInvoiceForServiceCenter(bookingId: string, serviceCenterId: string): Promise<ServiceCenterInvoiceResponseDTO> {
        
        const invoice = await this._invoiceRepo.findByBookingId(bookingId)
        if(!invoice) throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)

    if(invoice.serviceCenterId.toString() !== serviceCenterId){
    throw new AppError(MESSAGES.COMMON.UNAUTHORIZED,HttpStatus.UNAUTHORIZED)
     }
     return InvoiceMapper.toServiceCenterDTO( invoice as any)
    }

    async createPaymentOrder(invoiceId: string, userId: string): Promise<{ orderId: string; amount: number; currency: string; }> {
        
        const invoice = await this._invoiceRepo.findById(invoiceId)

        if(!invoice) throw new AppError(MESSAGES.COMMON.NOT_FOUND,HttpStatus.NOT_FOUND)

        if(invoice.userId.toString() !== userId){
            throw new AppError(MESSAGES.COMMON.UNAUTHORIZED,HttpStatus.UNAUTHORIZED)
        }
        if(invoice.paymentStatus === "paid"){
            throw new AppError(MESSAGES.INVOICE.ALREADY_PAID,HttpStatus.BAD_REQUEST)
        }
        const order = await getRazorpayInstance().orders.create({
             amount: invoice.balanceDue * 100,
             currency:"INR",
             receipt: `invoice_${invoiceId}`,
        })
        return { orderId: order.id, amount: invoice.balanceDue, currency: "INR" };
    }
   async verifyPayment(invoiceId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string): Promise<InvoiceResponseDTO> {

    
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex")

    if (expectedSignature !== razorpaySignature) {
        await this._invoiceRepo.markAsFailed(invoiceId)
        throw new AppError(MESSAGES.INVOICE.PAYMENT_VERIFICATION_FAILED, HttpStatus.BAD_REQUEST)
    }

    const updated = await this._invoiceRepo.markAsPaid(invoiceId, razorpayPaymentId)
    if (!updated) throw new AppError(MESSAGES.COMMON.NOT_FOUND, HttpStatus.NOT_FOUND)

        try {
            
            await this._walletService.recordInvoiceSettlement({
                invoiceId,
                bookingId: updated.bookingId.toString(),
                serviceCenterId: updated.serviceCenterId,
                serviceCenterPayout:updated.serviceCenterPayout,
                platformFeeAmount: updated.platformFeeAmount,
                advancePaid: updated.advancePaid
            })
        } catch (error) {
            logger.error(`Wallet settlement failed for invoice ${invoiceId}`, error)
        }
          await this._notificationService.notify({
        recipientId: updated.serviceCenterId.toString(),
        recipientRole: "serviceCenter",
        type: "booking_status",
        title: "Payment received",
        message: `Balance payment of ₹${updated.balanceDue} received for booking`,
        referenceId: updated.bookingId.toString(),
        referenceType: "booking",
    })
    return InvoiceMapper.toUserDTO(updated as any)
}
}


