import { schedule } from 'node-cron';
import logger from '@logger';

import { CREATE_NEW_ROULETTE_ROUND, UPDATE_ROULETTE_ROUND, PLAY_ROULETTE_ROUND } from './game-logic';

// Game Globals
let ROULETTE_ROUND = null as Roulette.RoulettePlay | null;
let ROULETTE_PLAYERS = [] as Player.Player[];
let ROULETTE_ROUND_BETS = [] as Roulette.RoulettePlayerBet[];

function START_ROULETTE(): void {
    schedule('*/3 * * * *', async function () {
        logger.section('ROULLETE ROUND STARTING');

        // Create a new roulette round
        ROULETTE_ROUND = await CREATE_NEW_ROULETTE_ROUND();
        logger.info(`Starting a new roullete round (ID: '${ROULETTE_ROUND?.id}').`);

        if (ROULETTE_ROUND === null) return;

        // After 2 Minutes & 30 Seconds, lock the active round so no further bets can be placed.
        setTimeout(async () => {
            logger.info(`Locking this round, no further bets will be allowed (ID: '${ROULETTE_ROUND?.id}').'`);
            if (ROULETTE_ROUND === null) return;
            (ROULETTE_ROUND.state = Roulette.RoulettePlayState.LOCKED), await UPDATE_ROULETTE_ROUND(ROULETTE_ROUND);
        }, 150000);

        if (ROULETTE_ROUND === null) return;

        // 10 Seconds following a round lock, play the active round.
        setTimeout(async () => {
            ROULETTE_ROUND = await PLAY_ROULETTE_ROUND(ROULETTE_ROUND);
            if (ROULETTE_ROUND === null) return;
            ROULETTE_ROUND.state = Roulette.RoulettePlayState.FINAL;
            UPDATE_ROULETTE_ROUND(ROULETTE_ROUND);
            logger.info(`Round has been played, winning number was '${ROULETTE_ROUND?.winningNumber}' (ID: '${ROULETTE_ROUND?.id}').'`);
        }, 160000);

        if (ROULETTE_ROUND === null) return;

        // 10 Seconds following a round play, reset the game
        setTimeout(async () => {
            ROULETTE_ROUND = null;
            ROULETTE_PLAYERS = [];
            ROULETTE_ROUND_BETS = [];
        }, 170000);

        // Logger
        setTimeout(() => logger.section('ROULLETE ROUND FINISHED'), 177000);
    });

    return;
}

START_ROULETTE();

export { ROULETTE_ROUND, ROULETTE_PLAYERS, ROULETTE_ROUND_BETS };
