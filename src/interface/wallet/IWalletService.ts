import { WalletResponseDTO } from "../../dto/wallet/walletDTO";
import { AdvanceRefundInput, AdvanceSettlementInput, InvoiceSettlementInput,SubscriptionPaymentInput } from "./IWallet";


export interface IWalletService {

    getServiceCenterWallet(serviceCenterId:string,page?:number,limit?:number):Promise<WalletResponseDTO>
    getPlatformWallet(page?:number,limit?:number):Promise<WalletResponseDTO>

    recordInvoiceSettlement(input:InvoiceSettlementInput):Promise<void>
    recordSubscriptionPayment(input:SubscriptionPaymentInput):Promise<void>

    recordAdvanceSettlement(input:AdvanceSettlementInput):Promise<void>
    recordAdvanceRefund(input: AdvanceRefundInput):Promise<void>
}

