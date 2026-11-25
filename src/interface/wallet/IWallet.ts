import { Types } from "mongoose";

export type WalletOwnerType = "serviceCenter" | "platform";

export type WalletTransactionType = "credit" | "debit";

export type WalletTransactionSource =
  | "invoice_payout"
  | "platform_fee"
  | "subscription"
  | "advance_payout"
  | "advance_fee"
  | "advance_refund"
  | "advance_fee_refund";

export type WalletReferenceType = "invoice" | "subscription" | "booking";

export type WalletTransactionStatus = "completed" | "pending" | "failed";

export interface IWallet {
  _id?: Types.ObjectId;
  ownerType: WalletOwnerType;
  ownerId: Types.ObjectId | null;
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWalletTransaction {
  _id?: Types.ObjectId;
  walletId: Types.ObjectId;
  type: WalletTransactionType;
  amount: number;
  source: WalletTransactionSource;
  referenceId: string;
  referenceType: WalletReferenceType;
  status: WalletTransactionStatus;
  balanceAfter: number;
  description?: string;
  createdAt?: Date;
}

export interface CreditWalletInput {
  ownerType: WalletOwnerType;
  ownerId: Types.ObjectId | null;
  amount: number;
  source: WalletTransactionSource;
  referenceId: string;
  referenceType: WalletReferenceType;
  description?: string;
}

export type DebitWalletInput = CreditWalletInput;

export interface InvoiceSettlementInput {

  invoiceId: string;
  bookingId: string;
  advancePaid:number;
  serviceCenterId: Types.ObjectId;
  serviceCenterPayout: number;
  platformFeeAmount: number;
}

export interface SubscriptionPaymentInput {
  paymentId: string;
  amount: number;
}

export interface AdvanceSettlementInput { 

    bookingId:string;
    serviceCenterId: Types.ObjectId;
    advanceAmount: number; 
}

export type AdvanceRefundInput = AdvanceSettlementInput;