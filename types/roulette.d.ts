namespace Roulette {
    interface RoulettePlayerBet {
        id: number;
        bet: string;
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

    enum RoulettePlayerPlayState {
        PENDING = 'PENDING',
        WON = 'WON',
        LOST = 'LOST',
        CANCELLED = 'CANCELLED',
    }

    interface RoulettePlay {
        id: number;
        winningNumber: number | null;
        state: RoulettePlayState;
        createdAt: Date;
        updatedAt: Date;
        roulettePlayerBet?: RoulettePlayerBet[];
        roulettePlayers?: Player.Player[];
        PlayerOnRoulettePlay?: PlayerOnRoulettePlay[];
    }

    enum RoulettePlayState {
        PENDING = 'PENDING',
        LOCKED = 'LOCKED',
        FINAL = 'FINAL',
    }
}
