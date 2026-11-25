
import { IInvoiceDocument } from "../../interface/Invoice/Iinvoice";

export interface IInoiceReadRepository{

    findByBookingId(bookingId: string):Promise<IInvoiceDocument | null>
    findById(invoiceId:string):Promise<IInvoiceDocument | null>
    findByServiceCenter(serviceCenterId:string,page:number,limit:number):Promise <{ items: IInvoiceDocument[]; total: number}>
    findByUser(userId:string,page:number,limit:number): Promise<{ items: IInvoiceDocument[]; total:number}>
}

export interface IInvoiceWriteRepository {

    create(data:Partial<IInvoiceDocument>): Promise<IInvoiceDocument>
    markAsPaid(invoiceId:string,paymentId:string):Promise< IInvoiceDocument | null>
    markAsFailed(invoiceId:string):Promise< IInvoiceDocument | null>
}