namespace Player {
    interface Player {
        id: number;
        name: string;
        discordId: string;
        availableFunds: number;
        createdAt: Date;
        updatedAt: Date;
        roulettePlayerBet: Roulette.RoulettePlayerBet[];
        // WonderwheelPlay      : Roulette.WonderwheelPlay[];
        roulettePlay: Roulette.RoulettePlay[];
        PlayerOnRoulettePlay: Roulette.PlayerOnRoulettePlay[];
    }
}
