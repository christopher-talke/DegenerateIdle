import { Roulette } from '../../roulette/types/roulette';

export declare namespace Player {
    interface Player {
        id: number;
        name: string;
        discordId: string;
        availableFunds: number;
        createdAt: Date;
        updatedAt: Date;

        // Relations
        roulettePlay: Roulette.RoulettePlay[]?;
        roulettePlayerBet: Roulette.RoulettePlayerBet[]?;
        PlayerOnRoulettePlay: Roulette.PlayerOnRoulettePlay[]?;
        WonderwheelPlay: any[]?;

        // Temporary values
        positionChange?: number;
        fundsAtRisk?: number;
    }
}
