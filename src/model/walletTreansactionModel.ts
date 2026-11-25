import mongoose, {Schema} from "mongoose";

import { IWalletTransaction } from "../interface/wallet/IWallet";

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },                                  
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    source: {
      type: String,
       enum: ["invoice_payout", "platform_fee", "subscription", "advance_payout", "advance_fee", "advance_refund", "advance_fee_refund"],
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
    },
    referenceType: {
      type: String,
     enum: ["invoice", "subscription", "booking"],
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

walletTransactionSchema.index({ walletId:1, source: 1, referenceId: 1},{ unique: true});

walletTransactionSchema.index({ walletId:1, createdAt:-1})


const WalletTransaction = mongoose.model<IWalletTransaction>("WalletTransaction",walletTransactionSchema)

export default WalletTransaction
