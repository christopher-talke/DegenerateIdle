import { schedule } from 'node-cron';
import logger from '../../../utils/logger';

import { CREATE_NEW_ROULETTE_ROUND, UPDATE_ROULETTE_ROUND, PLAY_ROULETTE_ROUND } from './game-logic';
import { GENERATE_PLAYER_BETS, GENERATE_PLAYERS, UPDATE_DISCORD_MESSAGE, DUMP_TO_HISTORY } from '../discord/roulette';
import { PROCESS_ROULETTE_RESULTS } from './result-logic';

import { RoulettePlay, RoulettePlayState } from '@prisma/client';
import { RepeatBet, RoulettePlayerBetExt } from '../types/roulette'
import { RoulettePlayer } from '../../player/types/player'
import { redis } from '../../../redis/client';
import { PROCESS_ROULETTE_BET } from './betting-logic';

// Game Globals
export let ROULETTE_ROUND = null as RoulettePlay | null;
export let ROULETTE_PLAYERS = [] as RoulettePlayer[];
export let ROULETTE_ROUND_BETS = [] as RoulettePlayerBetExt[];
export let ROULLETE_MSECOND_COUNT = 60000 * 2.5;
export let ROULETTE_ROUND_CURRENT_STATUS = `PREPARING FOR NEW GAME...`;
export let ROULETTE_ROUND_PREV_STATE = `${ROULETTE_PLAYERS.length}|${ROULETTE_ROUND_BETS.length}|${ROULETTE_ROUND_CURRENT_STATUS}`;

export function SET_ROULETTE_PLAYERS(NEW_PLAYERS: RoulettePlayer[]) {
    return (ROULETTE_PLAYERS = NEW_PLAYERS);
}

export function SET_ROULETTE_ROUND_BETS(NEW_ROUND_BETS: RoulettePlayerBetExt[]) {
    return (ROULETTE_ROUND_BETS = NEW_ROUND_BETS);
}

async function START_ROULETTE() {

    const intialMessage = `**Roullete Round Details**` +
                          '```' +
                          `ROUND #:           -` +
                          `STATUS:            ${ROULETTE_ROUND_CURRENT_STATUS}` +
                          `NO MORE BETS:      -` +
                          `-----` +
                          `DRAWN #:           ${ROULETTE_ROUND?.winningNumber || '-'}` +
                          `-----` +
                          `PLAYERS:           -` +
                          `BETS:              -` +
                          '```';

    await UPDATE_DISCORD_MESSAGE(intialMessage);

    schedule('*/3 * * * *', async function () {
        logger.section('ROULLETE ROUND STARTING');

        const ROUND_TIMER = setInterval(async () => {
            ROULLETE_MSECOND_COUNT = ROULLETE_MSECOND_COUNT - 1000;
            const ROULLETE_SECOND_COUNT = ROULLETE_MSECOND_COUNT / 1000 - 1;

            let ROULETTE_ROUND_NEW_STATE = `${ROULETTE_PLAYERS.length}|${ROULETTE_ROUND_BETS.length}|${ROULETTE_ROUND_CURRENT_STATUS}`;
            let ROULETTE_STATE_UPDATED = ROULETTE_ROUND_PREV_STATE !== ROULETTE_ROUND_NEW_STATE;

            let message = `**Round Details**\n` +
                          '```' +
                          `ROUND #:           ${ROULETTE_ROUND?.id || '-'}\n` +
                          `STATUS:            ${ROULETTE_ROUND_CURRENT_STATUS}\n` +
                          `NO MORE BETS:      ${ROULLETE_SECOND_COUNT < 0 ? '-' : `${ROULLETE_SECOND_COUNT}s`}\n` +
                          `-----\n` +
                          `DRAWN #:           ${ROULETTE_ROUND?.winningNumber || '-'}\n` +
                          `-----\n` +
                          `PLAYERS:           ${ROULETTE_PLAYERS.length}\n` +
                          `BETS:              ${ROULETTE_ROUND_BETS.length}\n` +
                          '```';

            if (ROULETTE_PLAYERS.length !== 0 || ROULETTE_ROUND_BETS.length !== 0) {
                message += `**Player Details**\n` +
                           '```\n' +
                           `${GENERATE_PLAYERS()}\n` +
                           '```\n';

                message += `**Bet Details**\n` +
                           '```\n' +
                           `${GENERATE_PLAYER_BETS()}\n` +
                           '```\n';
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
        ROULETTE_ROUND = (await CREATE_NEW_ROULETTE_ROUND()) as RoulettePlay;
        if (ROULETTE_ROUND === null) return;
        ROULETTE_ROUND_CURRENT_STATUS = 'OPEN';
        logger.info(`Starting a new roullete round (ID '${ROULETTE_ROUND?.id}').`);

        // Once the game is live, set any bets that have been placed on a repeat
        const betsToRepeat_str = await redis.get('roulette:repeat');
        if (betsToRepeat_str) {

            const playersWithBetsToRepeat = JSON.parse(betsToRepeat_str) as RepeatBet[];
            for (let i = 0; i < playersWithBetsToRepeat.length; i++) {

                const playerWithRepeats = playersWithBetsToRepeat[i];
                let breakLoop = false;
                for (let j = 0; j < playerWithRepeats.betsToRepeat.length; j++) {
                    const bet = playerWithRepeats.betsToRepeat[j];
                    const result = await PROCESS_ROULETTE_BET(playerWithRepeats.discordId, playerWithRepeats.guildId, bet);

                    // If the player has insufficient funds, break the betting loop
                    if (result === 'INSUFFICIENT_FUNDS') {
                        breakLoop = true;
                        break;
                    }
                }

                // If the player has insufficient funds or the repeat count has reached 0, remove the player from the repeat list
                playerWithRepeats.roundsToRepeat = playerWithRepeats.roundsToRepeat - 1;
                if (playerWithRepeats.roundsToRepeat <= 0 || breakLoop) {
                    playersWithBetsToRepeat.splice(i, 1);
                }
                
            }
            
            await redis.set('roulette:repeat', JSON.stringify(playersWithBetsToRepeat));
        }


        // After 2 Minutes & 30 Seconds, lock the active round so no further bets can be placed.
        setTimeout(async () => {
            if (ROULETTE_ROUND === null) return;
            ROULETTE_ROUND.state = RoulettePlayState.LOCKED;
            await UPDATE_ROULETTE_ROUND(ROULETTE_ROUND);
            ROULETTE_ROUND_CURRENT_STATUS = `LOCKED`;
            logger.info(`Locking this round, no further bets will be allowed (ID '${ROULETTE_ROUND?.id}').'`);
        }, 150000);

        if (ROULETTE_ROUND === null) return;

        // 10 Seconds following a round lock, play the active round.
        setTimeout(async () => {

            if (ROULETTE_ROUND === null) return;
            ROULETTE_ROUND = await PLAY_ROULETTE_ROUND(ROULETTE_ROUND);

            if (ROULETTE_ROUND === null) return;
            ROULETTE_ROUND.state = RoulettePlayState.FINAL;
            UPDATE_ROULETTE_ROUND(ROULETTE_ROUND);
            ROULETTE_ROUND_CURRENT_STATUS = `FINISHED`;

            logger.info(`Round has been played, winning number was '${ROULETTE_ROUND?.winningNumber}' (ID '${ROULETTE_ROUND?.id}').'`);

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