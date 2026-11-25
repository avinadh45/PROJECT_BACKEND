import { MESSAGES } from "../../constants/message";
import { HttpStatus } from "../../enums/httpstatus";
import { IInvoiceService } from "../../interface/Invoice/IinvoiceService";
import { sendSuccess } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";


export class InvoiceController { 

    constructor(private _invoiceService : IInvoiceService){}

    generateInvoice = asyncHandler(async(req:Request,res:Response)=>{

        const serviceCenterId = (req as any).serviceCenter.id 
        const { bookingId }  = req.params 
        const result = await this._invoiceService.generateInvoice(bookingId as string,serviceCenterId)
        sendSuccess(res,result,MESSAGES.INVOICE.INVOICE_GENERATED,HttpStatus.OK)
    })

    getInvoiceForUser = asyncHandler(async(req:Request,res:Response)=>{

        const userId = ( req as any).user.id 
        const { bookingId } = req.params; 
        const result = await this._invoiceService.getInvoiceForUser(bookingId as string , userId) 
        sendSuccess( res,result,MESSAGES.INVOICE.INVOICE_FETCHED,HttpStatus.OK)
    })

    getInvoiceForServiceCenter = asyncHandler(async(req:Request,res:Response)=>{

        const serviceCenterId = (req as any).serviceCenter.id
        const { bookingId }  = req.params 
        const result = await this._invoiceService.getInvoiceForServiceCenter(bookingId as string,serviceCenterId) 
        sendSuccess(res,result,MESSAGES.INVOICE.INVOICE_FETCHED,HttpStatus.OK)
    })

    createPaymentOrder = asyncHandler(async(req:Request,res:Response)=>{

        const userId = (req as any).user.id;
        const { invoiceId } = req.params; 
        const result  = await this._invoiceService.createPaymentOrder(invoiceId as string,userId)
        sendSuccess(res,result,MESSAGES.INVOICE.PAYEMNT_ORDER,HttpStatus.OK)
    })

    verifyPayment = asyncHandler(async(req:Request,res:Response)=>{

        const { invoiceId } = req.params 
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body; 
        const result = await this._invoiceService.verifyPayment(invoiceId as string,razorpayOrderId,razorpayPaymentId,razorpaySignature)
        sendSuccess(res,result,MESSAGES.INVOICE.PAYMENT_VERIFIED,HttpStatus.OK)
    })
}