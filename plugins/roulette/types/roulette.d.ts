import { Player } from '../../player/types/player';

export declare namespace Roulette {
    interface RoulettePlayerBet {
        id: number;
        bet: string | number;
        amount: number;
        result: number;
        state: RoulettePlayerPlayState;
        createdAt: Date;
        updatedAt: Date;
        playerId: number;
        roulettePlayId: number;
        player?: Player.Player;
        roulettePlay?: RoulettePlay;
    }

    type RoulettePlay = {
        id: number;
        winningNumber: number | null;
        state: RoulettePlayState;
        createdAt: Date;
        updatedAt: Date;
        roulettePlayerBet?: RoulettePlayerBet[];
        roulettePlayers?: Player.Player[];
        PlayerOnRoulettePlay?: PlayerOnRoulettePlay[];
    } | null;

    type PlayerOnRoulettePlay = {
        playerId: number;
        roulettePlayId: number;
        createdAt: Date;
        updatedAt: Date;
    };
}

export const enum RoulettePlayerPlayState {
    PENDING = 'PENDING',
    WON = 'WON',
    LOST = 'LOST',
    CANCELLED = 'CANCELLED',
}

export const enum RoulettePlayState {
    PENDING = 'PENDING',
    LOCKED = 'LOCKED',
    FINAL = 'FINAL',
}
