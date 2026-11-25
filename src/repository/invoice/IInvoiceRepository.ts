import { BaseRepository } from "../base/BaseRepository";
import  InvoiceModel  from "../../model/invoiceModel";
import { IInvoiceDocument } from "../../interface/Invoice/Iinvoice";

import { IInoiceReadRepository,IInvoiceWriteRepository } from "../../interface/Invoice/IinvoiceRepository";

export class InvoiceRepository extends BaseRepository<IInvoiceDocument> implements IInoiceReadRepository,IInvoiceWriteRepository {

    constructor() {
    super(InvoiceModel);
  }

  async findByBookingId(bookingId: string): Promise<IInvoiceDocument | null> {
      return await InvoiceModel.findOne({ bookingId}).lean()
  }


  async findById(id: string): Promise<IInvoiceDocument | null> {
      
    return await InvoiceModel.findById(id)
  }

  async findByServiceCenter(serviceCenterId: string, page: number, limit: number): Promise<{ items: IInvoiceDocument[]; total: number; }> {
      
    const skip = ( page - 1) * limit 
    const [ items,total] = await Promise.all([ InvoiceModel.find({serviceCenterId}).sort({ generatedAt: -1  }).skip(skip).limit(limit).lean(),
        InvoiceModel.countDocuments({ serviceCenterId })
     ]);
     return { items,total }
  }

  async findByUser(userId: string, page: number, limit: number): Promise<{ items: IInvoiceDocument[]; total: number; }> {
      
    const skip = ( page - 1)*limit 
    const [ items,total] = await Promise.all([InvoiceModel.find({userId}).sort({ generatedAt: -1 }).skip(skip).limit(limit).lean(),
        InvoiceModel.countDocuments({ userId})
    ])
    return { items, total}
  }

  async create(data: Partial<IInvoiceDocument>): Promise<IInvoiceDocument> {
      
    return InvoiceModel.create(data)
  }

  async markAsPaid(invoiceId: string, paymentId: string): Promise<IInvoiceDocument | null> {
      
    return InvoiceModel.findByIdAndUpdate(invoiceId,{paymentStatus:"paid",paymentId,paidAt: new Date()},{ returnDocument:"after"}).lean()
  }

  async markAsFailed(invoiceId: string): Promise<IInvoiceDocument | null> {
      
    return InvoiceModel.findByIdAndUpdate(invoiceId, { paymentStatus: "failed" },{new:true}).lean()
  }
}
