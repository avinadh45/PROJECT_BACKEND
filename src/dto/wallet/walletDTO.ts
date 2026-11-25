import { WalletReferenceType, WalletTransactionSource } from "../../interface/wallet/IWallet";

export interface WalletTransactionDTO { 

    id:string,
    type:  "credit" | "debit";
    amount:number;
    source: WalletTransactionSource
    referenceType: WalletReferenceType
    referenceId:string;
    status:"completed" | "pending" | "failed";
    balanceAfter:number;
    description: string | null ;
    createdAt: string;
}

export interface WalletPaginationDTO { 

    page:number;
    limit:number;
    total:number;
    totalPages:number;
}

export interface WalletResponseDTO { 

    balance:number;
    currency:string;
    transactions: WalletTransactionDTO[];
    pagination: WalletPaginationDTO;
}
