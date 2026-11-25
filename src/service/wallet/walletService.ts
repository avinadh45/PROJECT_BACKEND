import { IWalletService } from "../../interface/wallet/IWalletService";
import { IWalletReadRepository,IWalletWriteRepository } from "../../interface/wallet/IWalletRepository";
import { WalletMapper } from "../../mapper/wallet/WalletMapper";
import { Types } from "mongoose";
import { AdvanceRefundInput, AdvanceSettlementInput, CreditWalletInput, DebitWalletInput, InvoiceSettlementInput, SubscriptionPaymentInput, WalletOwnerType, WalletTransactionSource } from "../../interface/wallet/IWallet";
import { WalletResponseDTO } from "../../dto/wallet/walletDTO";
import { toPaise } from "../../utils/money";
import { calcPlatformFee } from "../../utils/platformFee";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 20;

export class WalletService implements IWalletService { 

    constructor( 
        private _walletRepo: IWalletReadRepository & IWalletWriteRepository,
       
    ){}

    getServiceCenterWallet(serviceCenterId: string, page?: number, limit?: number): Promise<WalletResponseDTO> {
        
        return this.getWallet("serviceCenter", new Types.ObjectId(serviceCenterId),page,limit)
    }

    private async getWallet( ownerType:WalletOwnerType, ownerId: Types.ObjectId | null, page = 1, limit = DEFAULT_PAGE_SIZE):Promise<WalletResponseDTO>{ 

        const safePage = Math.max(1,Math.floor(page))
        const safeLimit = Math.min(MAX_PAGE_SIZE,Math.max(1,Math.floor(limit))) 

        const wallet = await this._walletRepo.findByOwner(ownerType,ownerId)

        if(!wallet){

            return WalletMapper.toWalletDTO(null,[],0,safePage,safeLimit)
        }

        const { transactions, total } = await this._walletRepo.findTransactions(wallet._id!, safePage,safeLimit) 

        return WalletMapper.toWalletDTO(
            wallet,
            transactions,
            total,
            safePage,
            safeLimit
        )
    }
    getPlatformWallet(page?: number, limit?: number): Promise<WalletResponseDTO> {
        
        return this.getWallet("platform",null,page,limit)
    }

    private async wasCredited(ownerType: WalletOwnerType, ownerId: Types.ObjectId | null, source:WalletTransactionSource, referenceId: string):Promise<boolean>{ 

        const row = await this._walletRepo.findTransaction(ownerType,ownerId,source,referenceId)
        return row !== null
    }

    async recordInvoiceSettlement(input: InvoiceSettlementInput): Promise<void> {
        
         const { invoiceId, bookingId, serviceCenterId, serviceCenterPayout, platformFeeAmount, advancePaid } = input; 
         
         const advanceFee = calcPlatformFee(advancePaid)
         const advanceShare = advanceFee - advanceFee

         const garageAlreadyHas = (await this.wasCredited("serviceCenter",serviceCenterId,"advance_payout",bookingId)) ? advanceShare : 0 ; 

         const platformAlreadyHas = ( await this.wasCredited("platform",null,"advance_fee",bookingId)) ? advanceFee : 0

        await this.creditIfPositive({
            ownerType:"serviceCenter",
            ownerId: serviceCenterId,
            amount: toPaise(serviceCenterPayout - garageAlreadyHas),
            source: "invoice_payout",
            referenceId:invoiceId,
            referenceType:"invoice",
            description:"Payout for completed repair"

        })

        await this.creditIfPositive({ 
            ownerType:"platform",
            ownerId: null,
            amount: toPaise(platformFeeAmount - platformAlreadyHas),
            source:"platform_fee",
            referenceId:invoiceId,
            referenceType:"invoice",
            description: "Platform fee on completed repair",
        })
    }

    private async creditIfPositive(input: CreditWalletInput): Promise<void>{

        if(input.amount <=0 ) return 
        await this._walletRepo.credit(input)
    }
    private async debitIfPositive(input: DebitWalletInput):Promise<void>{
        if(input.amount <= 0) return 
        await this._walletRepo.debit(input)
    }

    async recordSubscriptionPayment(input: SubscriptionPaymentInput): Promise<void> {
        
        await this.creditIfPositive({
            ownerType:"platform",
            ownerId: null,
            amount:toPaise(input.amount),
            source:"subscription",
            referenceId: input.paymentId,
            referenceType:"subscription",
            description: "Garage subscription payment",
        })
    }

    async recordAdvanceSettlement(input: AdvanceSettlementInput): Promise<void> {
        
        const { bookingId, serviceCenterId, advanceAmount } = input 
        const fee = calcPlatformFee(advanceAmount)
        const share = advanceAmount - fee 
        
        await this.creditIfPositive({ 
            ownerType: "serviceCenter",
            ownerId: serviceCenterId , 
            amount: toPaise(share),
            source: "advance_payout",
            referenceId: bookingId,
            referenceType:"booking",
             description: "Advance payment for booking",
        })

        await this.creditIfPositive({
            ownerType:"platform", 
            ownerId: null,
            amount: toPaise(fee),
            source:"advance_fee",
            referenceId:bookingId,
            referenceType:"booking",
            description: "Platform fee on advance payment",
        })
    }

    async recordAdvanceRefund(input: AdvanceRefundInput): Promise<void> {
        
         const { bookingId, serviceCenterId, advanceAmount } = input; 
         const fee = calcPlatformFee(advanceAmount)
         const share = advanceAmount - fee 

         if( await this.wasCredited("serviceCenter",serviceCenterId,"advance_payout",bookingId)){

            await this.debitIfPositive({
                ownerType:"serviceCenter",
                ownerId: serviceCenterId,
                amount: toPaise(share),
                source: "advance_refund",
                referenceId: bookingId,
                referenceType: "booking",
                description: "Advance refunded to customer",
            })
         }
         if( await this.wasCredited("platform",null,"advance_fee",bookingId)){

            await this.debitIfPositive({
                ownerType:"platform",
                ownerId: null,
                amount: toPaise(fee),
                source: "advance_fee_refund",
                referenceId: bookingId,
                referenceType: "booking",
                description: "Platform fee returned on refunded advance",
            })
         }
    
    }
} 

