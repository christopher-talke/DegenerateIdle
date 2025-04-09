import { RoulettePlayerBet } from '@prisma/client'

export interface RoulettePlayerBetExt extends RoulettePlayerBet {
    amountAsNumber: number
}

export type RepeatBet = {
    betsToRepeat: bettingDataToBeProcessed[];
    roundsToRepeat: number;
    playerId: string;
    discordId: string;
    guildId: string;
}