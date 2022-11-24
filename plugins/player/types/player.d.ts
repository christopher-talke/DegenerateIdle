import { BankAccount, Player } from "@prisma/client";

export interface RoulettePlayer extends Player {
    BankAccount : BankAccount[];
    fundsAtRisk : number?;
    previousPosition: number?;
    newPosition: number?;
}
