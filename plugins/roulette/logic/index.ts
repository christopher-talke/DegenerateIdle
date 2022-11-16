import { schedule } from 'node-cron';
import logger from '../../../utils/logger';

import { CREATE_NEW_ROULETTE_ROUND, UPDATE_ROULETTE_ROUND, PLAY_ROULETTE_ROUND } from './game-logic';
import { GENERATE_PLAYER_BETS, GENERATE_PLAYERS, UPDATE_DISCORD_MESSAGE, DUMP_TO_HISTORY } from '../discord/roulette';
import { PROCESS_ROULETTE_RESULTS } from './result-logic';

import { Roulette, RoulettePlayState } from '../types/roulette';
import { Player } from '../../player/types/player';

// Game Globals
let ROULETTE_ROUND = null as Roulette.RoulettePlay;
let ROULETTE_PLAYERS = [] as Player.Player[];
let ROULETTE_ROUND_BETS = [] as Roulette.RoulettePlayerBet[];
let ROULLETE_MSECOND_COUNT = 60000 * 2.5;
let ROULETTE_ROUND_CURRENT_STATUS = `PREPARING FOR NEW GAME...`;
let ROULETTE_ROUND_PREV_STATE = `${ROULETTE_PLAYERS.length}|${ROULETTE_ROUND_BETS.length}|${ROULETTE_ROUND_CURRENT_STATUS}`;

async function START_ROULETTE() {
    const intialMessage = `**Roullete Round Details**
\`\`\`
ROUND #:           -
STATUS:            ${ROULETTE_ROUND_CURRENT_STATUS}
NO MORE BETS:      -
-----
DRAWN #:           ${ROULETTE_ROUND?.winningNumber || '-'}
-----
PLAYERS:           -
BETS:              -
\`\`\`
`;
    await UPDATE_DISCORD_MESSAGE(intialMessage);

    schedule('*/3 * * * *', async function () {
        logger.section('ROULLETE ROUND STARTING');

        const ROUND_TIMER = setInterval(async () => {
            ROULLETE_MSECOND_COUNT = ROULLETE_MSECOND_COUNT - 1000;
            const ROULLETE_SECOND_COUNT = ROULLETE_MSECOND_COUNT / 1000 - 1;

            let ROULETTE_ROUND_NEW_STATE = `${ROULETTE_PLAYERS.length}|${ROULETTE_ROUND_BETS.length}|${ROULETTE_ROUND_CURRENT_STATUS}`;
            let ROULETTE_STATE_UPDATED = ROULETTE_ROUND_PREV_STATE !== ROULETTE_ROUND_NEW_STATE;

            let message = `**Round Details**
\`\`\`
ROUND #:           ${ROULETTE_ROUND?.id || '-'}
STATUS:            ${ROULETTE_ROUND_CURRENT_STATUS}
NO MORE BETS:      ${ROULLETE_SECOND_COUNT < 0 ? '-' : `${ROULLETE_SECOND_COUNT}s`}
-----
DRAWN #:           ${ROULETTE_ROUND?.winningNumber || '-'}
-----
PLAYERS:           ${ROULETTE_PLAYERS.length}
BETS:              ${ROULETTE_ROUND_BETS.length}
\`\`\`
`;

            if (ROULETTE_PLAYERS.length !== 0 || ROULETTE_ROUND_BETS.length !== 0) {
                message += `**Player Details**
\`\`\`
${GENERATE_PLAYERS()}
\`\`\`
`;
                message += `**Bet Details**
\`\`\`
${GENERATE_PLAYER_BETS()}
\`\`\`
`;
            }

            if (ROULLETE_SECOND_COUNT % 5 === 0 || (ROULLETE_SECOND_COUNT < 30 && ROULLETE_SECOND_COUNT >= 0) || ROULETTE_STATE_UPDATED) {
                ROULETTE_ROUND_PREV_STATE = ROULETTE_ROUND_NEW_STATE;
                await UPDATE_DISCORD_MESSAGE(message);
                if (ROULETTE_ROUND?.winningNumber) {
                    await UPDATE_DISCORD_MESSAGE(message);
                }
            }
        }, 1000);

        // Create a new roulette round
        ROULETTE_ROUND = (await CREATE_NEW_ROULETTE_ROUND()) as Roulette.RoulettePlay;
        if (ROULETTE_ROUND === null) return;
        ROULETTE_ROUND_CURRENT_STATUS = 'OPEN';
        logger.info(`Starting a new roullete round (ID: '${ROULETTE_ROUND?.id}').`);

        // After 2 Minutes & 30 Seconds, lock the active round so no further bets can be placed.
        setTimeout(async () => {
            if (ROULETTE_ROUND === null) return;
            ROULETTE_ROUND.state = RoulettePlayState.LOCKED;
            await UPDATE_ROULETTE_ROUND(ROULETTE_ROUND);
            ROULETTE_ROUND_CURRENT_STATUS = `LOCKED`;
            logger.info(`Locking this round, no further bets will be allowed (ID: '${ROULETTE_ROUND?.id}').'`);
        }, 150000);

        if (ROULETTE_ROUND === null) return;

        // 10 Seconds following a round lock, play the active round.
        setTimeout(async () => {
            ROULETTE_ROUND = await PLAY_ROULETTE_ROUND(ROULETTE_ROUND);
            if (ROULETTE_ROUND === null) return;
            ROULETTE_ROUND.state = RoulettePlayState.FINAL;
            UPDATE_ROULETTE_ROUND(ROULETTE_ROUND);
            ROULETTE_ROUND_CURRENT_STATUS = `FINISHED`;
            logger.info(`Round has been played, winning number was '${ROULETTE_ROUND?.winningNumber}' (ID: '${ROULETTE_ROUND?.id}').'`);
            await PROCESS_ROULETTE_RESULTS(ROULETTE_ROUND, ROULETTE_PLAYERS, ROULETTE_ROUND_BETS);
        }, 160000);

        if (ROULETTE_ROUND === null) return;

        setTimeout(async () => {
            ROULETTE_ROUND_CURRENT_STATUS = 'PREPARING FOR NEW GAME...';
            DUMP_TO_HISTORY();
        }, 170000);

        setTimeout(async () => {
            ROULETTE_ROUND = null;
            ROULETTE_PLAYERS = [];
            ROULETTE_ROUND_BETS = [];
            await UPDATE_DISCORD_MESSAGE(intialMessage);
            logger.section('ROULLETE ROUND FINISHED');
        }, 177000);

        setTimeout(() => {
            logger.info('RESET ROUND TIMER');
            clearInterval(ROUND_TIMER);
            ROULLETE_MSECOND_COUNT = 60000 * 2.5;
        }, 179999);
    });

    return;
}

START_ROULETTE();

export function SET_ROULETTE_PLAYERS(NEW_PLAYERS: Player.Player[]) {
    return (ROULETTE_PLAYERS = NEW_PLAYERS);
}

export function SET_ROULETTE_ROUND_BETS(NEW_ROUND_BETS: Roulette.RoulettePlayerBet[]) {
    return (ROULETTE_ROUND_BETS = NEW_ROUND_BETS);
}

export { ROULETTE_ROUND, ROULETTE_PLAYERS, ROULETTE_ROUND_BETS, ROULETTE_ROUND_CURRENT_STATUS };
