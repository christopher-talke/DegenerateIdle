import { BankAccount, BankAccountTransaction } from "@prisma/client";

export interface BankAccountExt extends BankAccount {
    amountAsNumber: number
}

export interface BankAccountTransactionExt extends BankAccountTransaction {
    amountAsNumber: number
}