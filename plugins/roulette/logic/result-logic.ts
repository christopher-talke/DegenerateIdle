import * as _ from 'lodash';
import { prisma } from '../../../prisma/client';

import { SET_ROULETTE_PLAYERS, SET_ROULETTE_ROUND_BETS } from './index';

import IMPORTED_BETTING_PAYOUTS from './mapping/betting_payouts.json';
import IMPORTED_BETTING_OPTIONS from './mapping/betting_options.json';
import logger from '../../../utils/logger';
import { formatMoney } from '../../../utils/utilities';

import { RoulettePlay, RoulettePlayerBet, RoulettePlayerPlayState} from '@prisma/client';
import { RoulettePlayer } from '../../player/types/player'
import { RoulettePlayerBetExt } from '../types/roulette';

interface BettingPayouts {
    [key: string]: number;
}

interface BettingOptions {
    [key: string]: number[];
}

const BETTING_PAYOUTS: BettingPayouts = {
    ...IMPORTED_BETTING_PAYOUTS,
};

const BETTING_OPTIONS: BettingOptions = {
    ...IMPORTED_BETTING_OPTIONS,
};


export async function PROCESS_ROULETTE_RESULTS(passedRoulleteRound: RoulettePlay, roulletePlayers: RoulettePlayer[], roulleteBets: RoulettePlayerBetExt[]) {
    logger.info(`Calculating round results (ID '${passedRoulleteRound?.id}').`);

    // Deep clones to ensure reference can't get changed elsewhere as these results should be final.
    const roulleteRound = _.cloneDeep(passedRoulleteRound);
    const players = _.cloneDeep(roulletePlayers);
    const bets = _.cloneDeep(roulleteBets);

    // Calculate everything in memory for players and bets
    const playerResults = [];
    const betResuts = [];
    for (let i = 0; i < players.length; i++) {
        const player = _.cloneDeep(players[i]);
        const playersBets = bets.filter((bet) => bet.playerId === player.id);

        let totalCalculated = 0;
        logger.info(`Calculating results for player (ID '${player?.id}'), they have '${playersBets.length}' bets to review.`);
        for (let j = 0; j < playersBets.length; j++) {
            const playerBet = playersBets[j];
            if (roulleteRound && roulleteRound.winningNumber) {
                const isWinningBet = BETTING_OPTIONS[playerBet.bet].includes(roulleteRound.winningNumber);
                // Add the winning number to the bet
                playerBet.result = roulleteRound.winningNumber;
                if (isWinningBet) {
                    // Mark as a winning bet
                    playerBet.state = RoulettePlayerPlayState.WON;
                    // Calculate winning, and assign to player
                    const calculatedWinnings = playerBet.amountAsNumber * BETTING_PAYOUTS[playerBet.bet];
                    totalCalculated = totalCalculated + calculatedWinnings;
                    logger.info(`Winning result for bet (ID '${playerBet.id}') by player (ID '${player?.id}'), calculated winnings were '${formatMoney(calculatedWinnings)}'.`);

                    player.BankAccount[0].amountAsNumber = player.BankAccount[0].amountAsNumber + calculatedWinnings;

                } else {
                    // Mark as a lost bet
                    logger.info(`Losing result for bet (ID '${playerBet.id}') by player (ID '${player?.id}'), calculated loss was '${formatMoney(playerBet.amountAsNumber)}'.`);
                    let betAsNegative = playerBet.amountAsNumber * -1;
                    totalCalculated = totalCalculated + betAsNegative;
                    playerBet.state = RoulettePlayerPlayState.LOST;
                }

                // Save calculated bet result to memory
                betResuts.push(playerBet);
            }
        }

        if (player.previousPosition && player.fundsAtRisk) {
            player.newPosition = player.BankAccount[0].amountAsNumber;
        }

        playerResults.push(player);
    }

    // Update memory player and bet calculations 
    SET_ROULETTE_ROUND_BETS(betResuts);
    SET_ROULETTE_PLAYERS(playerResults);

    // Update database player and bet calculations
    await UPDATE_PLAYER_BETS(betResuts);
    await UPDATE_PLAYERS_BANKS(playerResults);

    logger.info(`Round results (ID '${roulleteRound?.id}') have been calculated and saved.`);
}

async function UPDATE_PLAYER_BETS(bets: RoulettePlayerBet[]) {
    for (let i = 0; i < bets.length; i++) {
        const { id, state, result } = bets[i];

        await prisma.roulettePlayerBet.update({
            where: {
                id: id,
            },
            data: {
                state,
                result,
            },
        });
    }
}

async function UPDATE_PLAYERS_BANKS(players: RoulettePlayer[]) {
    for (let i = 0; i < players.length; i++) {
        const { BankAccount } = players[i];

        await prisma.bankAccount.update({
            where : {
                id : BankAccount[0].id
            }, 
            data: {
                amount : `${BankAccount[0].amountAsNumber}`
            }
        })
    }
}
