import { IWallet, IWalletTransaction } from "../../interface/wallet/IWallet";
import { WalletResponseDTO, WalletTransactionDTO } from "../../dto/wallet/walletDTO";
import { toRupees } from "../../utils/money";

export class WalletMapper { 

    private static toTransactionDTO(t:IWalletTransaction): WalletTransactionDTO { 

        return {

            id:t._id!.toString(),
            type:t.type,
            amount:toRupees(t.amount),
            source:t.source,
            referenceType:t.referenceType,
            referenceId:t.referenceId,
            status:t.status,
            balanceAfter:toRupees(t.balanceAfter),
            description:t.description ?? null,
            createdAt:t.createdAt!.toISOString()
        }
    }

    static toWalletDTO( 
        wallet : IWallet | null,
        transactions: IWalletTransaction[],
        total:number,
        page:number,
        limit:number,

    ):WalletResponseDTO { 

        return {
            balance: wallet? toRupees(wallet.balance) :0 ,
            currency: wallet?.currency ?? "INR",
            transactions: transactions.map((a)=> this.toTransactionDTO(a)),
            pagination: {page,limit,total,totalPages:Math.ceil(total/limit)}
        }
    }
}