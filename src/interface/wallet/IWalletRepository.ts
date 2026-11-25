import { Types } from "mongoose";
import { CreditWalletInput,
    DebitWalletInput,
    InvoiceSettlementInput,
    IWallet,
    IWalletTransaction,
    SubscriptionPaymentInput,
    WalletOwnerType,
    WalletTransactionSource
 } from "./IWallet";

 export interface IWalletReadRepository {

    findByOwner(ownerType: WalletOwnerType, ownerId:Types.ObjectId | null):Promise<IWallet | null>

    findTransactions( walletId: Types.ObjectId,page:number,limit:number):Promise<{ transactions: IWalletTransaction[]; total:number}>

    findTransaction(ownerType:WalletOwnerType,ownerId:Types.ObjectId|null, source:WalletTransactionSource,referenceId:string):Promise< IWalletTransaction | null  >
 }

 export interface IWalletWriteRepository {

    findOrCreate(ownerType:WalletOwnerType,ownerId:Types.ObjectId | null):Promise<IWallet> 

    credit(input:CreditWalletInput) :Promise<IWalletTransaction | null>
   
    debit(input : DebitWalletInput): Promise < IWalletTransaction | null>

 }
 