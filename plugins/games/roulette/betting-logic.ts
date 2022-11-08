require('../types');
const { prisma } = require('../prisma/client');

// Global State Import
const { ROULETTE_ROUND, ROULETTE_PLAYERS, ROULETTE_ROUND_BETS } = require('./game');

async function PROCESS_ROULETTE_BET(discordUserId, bettingData) {
    // Validate the bet
    const isValidBet = VALIDATE_ROULETTE_BET(bettingData);

    if (isValidBet) {
        // Checking if the betting 'Player' is in the cache
        /** @type {playerData | undefined} */
        let playerData = ROULETTE_PLAYERS.find((player) => player.discordId === discordUserId);

        // Check if 'Player' data was actually in the cache
        const playerHasNotJoinedRound = playerData === undefined;
        if (playerHasNotJoinedRound) {
            // If not, go get them and cache their details...
            playerData = await JOIN_PLAYER_TO_ROULETTE_ROUND(discordUserId);
        }

        await CREATE_ROULETTE_BET(playerData, bettingData);
    }
}

function VALIDATE_ROULETTE_BET(bettingData) {
    // Validate the betting amount
    // Rule: Ensure input can only be a positive integer.
    let IS_VALID_AMOUNT = true;
    bettingData.amount = Number(bettingData.amount);
    IS_VALID_AMOUNT = Number.isInteger(bettingData.amount); // If not an integer, return false
    IS_VALID_AMOUNT = bettingData.amount >= 1; // If less than 1, return false
    IS_VALID_AMOUNT = typeof bettingData.amount === 'number'; // If a type other than Number, return false

    // Validates the betting type
    // Rule: Ensure the betting type input matches any of the values in the VALID_XXX_BETS arrays.
    let IS_VALID_BET = true;
    const BET_TYPE = typeof bettingData.bet;
    const VALID_NUMBER_BETS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38];
    const VALID_OTHER_BETS = ['black', 'red', 'first_half', 'second_half', 'odd', 'even', 'first_row', 'second_row', 'third_row', 'first_third', 'second_third', 'third_third'];
    if (BET_TYPE === 'string') {
        IS_VALID_BET = VALID_OTHER_BETS.includes(bettingData.bet);
    } else if (BET_TYPE === 'number') {
        bettingData.bet = Number(bettingData.bet);
        IS_VALID_BET = VALID_NUMBER_BETS.includes(bettingData.bet);
    } else {
        IS_VALID_BET = false;
    }

    return IS_VALID_AMOUNT && IS_VALID_BET;
}

async function JOIN_PLAYER_TO_ROULETTE_ROUND(discordUserId) {
    try {
        const playerData = await prisma.player.findUnique({
            where: {
                discordId: discordUserId,
            },
        });

        await prisma.playerOnRoulettePlay.create({
            data: {
                playerId: playerData.id,
                roulettePlayId: ROULETTE_ROUND.id,
            },
        });

        ROULETTE_PLAYERS.push(playerData);

        return playerData;
    } catch (error) {
        console.log(error);
    }
}

async function CREATE_ROULETTE_BET(playerData, bettingData) {
    try {
        const createdRouletteBet = await prisma.roulettePlayerBet.create({
            data: {
                bet: bettingData.bet,
                amount: bettingData.amount,
                playerId: playerData.id,
            },
        });
        const hasPlayedJoinedRound = ROULETTE_PLAYERS.find((player) => player.id === playerData.id);
        if (hasPlayedJoinedRound === undefined) {
            ROULETTE_PLAYERS.push(playerData);
        }
        ROULETTE_ROUND_BETS.push(createdRouletteBet);
    } catch (error) {
        console.error(error);
    }
}
