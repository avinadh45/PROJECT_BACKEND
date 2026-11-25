import { IInvoiceDocument } from "../../interface/Invoice/Iinvoice";
import { InvoiceResponseDTO,InvoiceItemDTO,ServiceCenterInvoiceResponseDTO } from "../../dto/invoice/invoiceDTO";

export class InvoiceMapper{

    private static mapItems(items:IInvoiceDocument["items"]):InvoiceItemDTO[] {
        return items.map((i)=>({
            description: i.description,
            sparePart: i.sparePart,
            quantity: i.quantity,
            cost:i.cost
        }))
    }

    static toUserDTO(doc: IInvoiceDocument & {_id:any}):InvoiceResponseDTO{
        return {
            id: doc._id.toString(),
            bookingId:doc.bookingId.toString(),
            items: this.mapItems(doc.items),
            subtotal: doc.subtotal,
            advancePaid: doc.advancePaid,
            balanceDue: doc.balanceDue,
            paymentStatus:doc.paymentStatus,
            paymentId:doc.paymentId,
            generatedAt:(doc as any).generatedAt
        }
    }
    static toServiceCenterDTO(doc: IInvoiceDocument & { _id: any }): ServiceCenterInvoiceResponseDTO {
  return {
    ...this.toUserDTO(doc),
    platformFeePercentage: doc.platformFeePercentage,
    platformFeeAmount: doc.platformFeeAmount,
    serviceCenterPayout: doc.serviceCenterPayout,
  };
}
}