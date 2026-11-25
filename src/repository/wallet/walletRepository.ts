import { Types } from "mongoose";

import WalletTransaction from "../../model/walletTreansactionModel";
import {
  IWalletReadRepository,
  IWalletWriteRepository,
} from "../../interface/wallet/IWalletRepository";

import {
  CreditWalletInput,
  DebitWalletInput,
  IWallet,
  IWalletTransaction,
  WalletOwnerType,
  WalletTransactionSource,
  WalletTransactionType,
} from "../../interface/wallet/IWallet";
import Wallet from "../../model/walletModel";

const DUPLICATE_KEY_ERROR = 11000;

export class WalletRepository
  implements IWalletReadRepository, IWalletWriteRepository
{
  findByOwner(
    ownerType: WalletOwnerType,
    ownerId: Types.ObjectId | null,
  ): Promise<IWallet | null> {
    return Wallet.findOne({ ownerType, ownerId }).lean<IWallet | null>().exec();
  }

  async findTransactions(
    walletId: Types.ObjectId,
    page: number,
    limit: number,
  ): Promise<{ transactions: IWalletTransaction[]; total: number }> {
    const [transactions, total] = await Promise.all([
      WalletTransaction.find({ walletId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IWalletTransaction[]>()
        .exec(),

      WalletTransaction.countDocuments({ walletId }).exec(),
    ]);
    return { transactions, total };
  }

  async findOrCreate(
    ownerType: WalletOwnerType,
    ownerId: Types.ObjectId | null,
  ): Promise<IWallet> {
    const filter = { ownerType, ownerId };

    try {
      const wallet = await Wallet.findOneAndUpdate(
        filter,
        { $setOnInsert: { balance: 0, currency: "INR" } },
        { upsert: true, new: true },
      )
        .lean<IWallet>()
        .exec();
      return wallet as IWallet;
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_ERROR) {
        return (await Wallet.findOne(filter).lean<IWallet>().exec()) as IWallet;
      }
      throw error;
    }
  }

  credit(input: CreditWalletInput): Promise<IWalletTransaction | null> {

      return this.postTransaction("credit",input )
  }

  debit(input: DebitWalletInput): Promise<IWalletTransaction | null> {
      return this.postTransaction("debit",input)
  }

  private async postTransaction(
    type: WalletTransactionType,
    input: CreditWalletInput,
  ): Promise<IWalletTransaction | null> {
    const sign = type === "credit" ? 1 : -1;
    const wallet = await this.findOrCreate(input.ownerType, input.ownerId);

    let transaction;

    try {
      transaction = await WalletTransaction.create({
        walletId: wallet._id!,
        type,
        amount: input.amount,
        source: input.source,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
        status: "completed",
        balanceAfter: wallet.balance + sign * input.amount,
        description: input.description,
      });
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_ERROR)
        return null;
      throw error;
    }
    const updated = await Wallet.findOneAndUpdate(
      { _id: wallet._id },
      { $inc: { balance: sign * input.amount } },
      { new: true },
    )
      .lean<IWallet | null>()
      .exec();

       if(!updated) throw new Error("Wallet disappeared while posting a transaction");

       await WalletTransaction.updateOne(
        {_id:transaction._id},
        { $set: { balanceAfter:updated.balance}}
       )
       return { ...transaction.toObject(),balanceAfter:updated.balance}
  }


  // async credit(input: CreditWalletInput): Promise<IWalletTransaction | null> {
  //     const wallet = await this.findOrCreate(input.ownerType,input.ownerId)
  //     let transaction;
  //     try {
  //         transaction = await WalletTransaction.create({
  //             walletId: wallet._id!,
  //             type:"credit",
  //             amount:input.amount,
  //             source: input.source,
  //             referenceId: input.referenceId,
  //            referenceType: input.referenceType,
  //            status:"completed",
  //            balanceAfter:wallet.balance + input.amount,
  //            description: input.description
  //         })
  //     } catch (error) {
  //         if((error as { code?: number}).code === DUPLICATE_KEY_ERROR)
  //             return null
  //         throw error;
  //     }
  //     const update = await Wallet.findOneAndUpdate(
  //         {_id:wallet._id},
  //         { $inc:{ balance: input.amount}},
  //         { new:true }
  //     ).lean<IWallet | null>().exec()

  //     if (!update) throw new Error("Wallet disappeared while crediting");

  //     await WalletTransaction.updateOne({_id:transaction._id},{ $set:{ balanceAfter: update.balance}})

  //     return { ...transaction.toObject(),balanceAfter:update.balance}
  // }

  async findTransaction(
    ownerType: WalletOwnerType,
    ownerId: Types.ObjectId | null,
    source: WalletTransactionSource,
    referenceId: string,
  ): Promise<IWalletTransaction | null> {
    const wallet = await this.findByOwner(ownerType, ownerId);
    if (!wallet) return null;

    return WalletTransaction.findOne({
      walletId: wallet._id,
      source,
      referenceId,
    })
      .lean<IWalletTransaction | null>()
      .exec();
  }
}
