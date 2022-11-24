import { Message } from 'discord.js';

import { prisma } from '../../../prisma/client';
import { redis } from '../../../redis/client';
import { formatMoney } from '../../../utils/utilities';
import { REGISTER_PLAYER } from '../../player/logic/registerPlayer';
import { RoulettePlayer } from '../../player/types/player';
import { SEND_DISCORD_MESSAGE } from '../../roulette/discord/roulette';
import { ROULETTE_PLAYERS } from '../../roulette/logic';

import IMPORTED_WONDERWHEEL_MULTIPLIERS from './mapping/wonderwheel-multipliers.json';
import IMPORTED_WONDERWHEEL_PRIZES from './mapping/wonderwheel-prizes.json';

const WONDERWHEEL_PRIZES: WonderwheelMultipliers = {
    ...IMPORTED_WONDERWHEEL_PRIZES,
};

interface WonderwheelPrizes {
    [key: string]: number;
}

const WONDERWHEEL_MULTIPLIERS: WonderwheelMultipliers = {
    ...IMPORTED_WONDERWHEEL_MULTIPLIERS,
};

interface WonderwheelMultipliers {
    [key: string]: number;
}

export async function PLAY_WONDERWHEEL(discordMessage: Message) {
    // Prevent player from wonderwheeling if they are in an active game
    const CACHE = ROULETTE_PLAYERS.find((player) => player.discordId === discordMessage.author.id);
    const isGambling = CACHE !== undefined;
    if (isGambling) {
        await SEND_DISCORD_MESSAGE({ discordUserId: discordMessage.author.id, targetChannelKey: 'WONDERWHEEL_CHANNEL_ID', guildId: discordMessage.guildId }, `you're currently gambling, please wait until you are finished to play the wonderwheel.`);
        return;
    }

    // Prevent player from wonderwheeling if they have played recently
    const RECENT_PLAY = await redis.get(`wonderwheel-${discordMessage.author.id}`);
    if (RECENT_PLAY) {
        await SEND_DISCORD_MESSAGE({ discordUserId: discordMessage.author.id, targetChannelKey: 'WONDERWHEEL_CHANNEL_ID', guildId: discordMessage.guildId }, `you've played recently, try again soon!`);
        return;
    }

    // Not gambling, or played recently... so lets spin.
    const randomPrize = WONDERWHEEL_PRIZES[`${Math.floor(Math.random() * 24)}` as keyof WonderwheelPrizes];
    const randomMultiplier = WONDERWHEEL_MULTIPLIERS[`${Math.floor(Math.random() * 24)}` as keyof WonderwheelPrizes];
    const winningAmount = randomPrize * randomMultiplier;

    // Get user, update Available Funds, and cache the play with an hour expiry.
    let player = await prisma.player.findFirst({
        where: {
            discordId: discordMessage.author.id,
        },
        include : {
            BankAccount: {
                where: {
                    type: 'SPENDINGS'
                }
            }
        }
    }) as RoulettePlayer | null

    if (player === null) {
        player = await REGISTER_PLAYER(discordMessage.author.id, discordMessage.author.username);

        await SEND_DISCORD_MESSAGE({ discordUserId: discordMessage.author.id, targetChannelKey: 'WONDERWHEEL_CHANNEL_ID', guildId: discordMessage.guildId }, `looks like you havn't played before, we've just registered you. You've also been gifted $1,000 to start with!`);
    }

    if (player) {
        player.BankAccount[0].amountAsNumber = player.BankAccount[0].amountAsNumber + winningAmount;

        await prisma.bankAccount.update({
            where: {
                id: player.BankAccount[0].id
            },
            data : {
                amount : `${player.BankAccount[0].amountAsNumber}`
            }
        })

        const currentTime = new Date()
        await redis.set(`wonderwheel-${discordMessage.author.id}`, 1, 'EX', 3600);
        await SEND_DISCORD_MESSAGE(
            { discordUserId: discordMessage.author.id, targetChannelKey: 'WONDERWHEEL_CHANNEL_ID', guildId: discordMessage.guildId },
            'see your results below:\n```' + 
            `Prize:                  ${formatMoney(randomPrize)}\n` +
            `Multiplier:             x${randomMultiplier}\n` +
            `Winning Amount:         ${formatMoney(winningAmount)}\n` +
            '```\n' +
            `You'll be able to play again at around '${currentTime.getHours() + 1}:${currentTime.getMinutes()}'!`
        );
    } else {
        await SEND_DISCORD_MESSAGE({ discordUserId: discordMessage.author.id, targetChannelKey: 'WONDERWHEEL_CHANNEL_ID', guildId: discordMessage.guildId }, `uhhh... looks like there was a problem playing the wonderwheel, sorry!`);
    }
    return;
}
