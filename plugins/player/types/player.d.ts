import { Player } from "@prisma/client";
import { BankAccountExt } from '../../bank/types/bank'
export interface RoulettePlayer extends Player {
    amountAsNumber : number,
    BankAccount : BankAccountExt[];
    fundsAtRisk : number?;
    previousPosition: number?;
    newPosition: number?;
}