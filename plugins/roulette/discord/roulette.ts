import { discord, discordBotStatus } from '../../../discord/bot';
import * as _ from 'lodash';
import Table from 'easy-table';
import { CONFIG } from '../../../config';

import { ROULETTE_ROUND, ROULETTE_PLAYERS, ROULETTE_ROUND_BETS } from '../logic/index';
import { formatMoney } from '../../../utils/utilities';
import { PROCESS_ROULETTE_BET, JOIN_PLAYER_TO_ROULETTE_ROUND } from '../logic/betting-logic';

import IMPORTED_BETTING_PAYOUTS from '../logic/mapping/betting_payouts.json';
import IMPORTED_BETTING_TRANSLATIONS from '../logic/mapping/betting_translation.json';
import logger from '../../../utils/logger';

interface BettingOptions {
    [key: string]: number;
}

interface BettingTranslations {
    [key: string]: string;
}

const { ROULLETE } = CONFIG.DISCORD_BOT.PLUGINS;

let CURRENT_ROUND = 0;
const BETTING_PAYOUTS: BettingOptions = {
    ...IMPORTED_BETTING_PAYOUTS,
};
const BETTING_TRANSLATIONS: BettingTranslations = {
    ...IMPORTED_BETTING_TRANSLATIONS,
};

type Guild = {
    GUILD_ID: string;
    BETTING_CHANNEL_ID: string;
    BETTING_TEXT_MESSAGE_ID: string;
    HISTORY_CHANNEL_ID: string;
};

type DISCORD_IDS = {
    targetChannelKey: string;
    targetChannelId?: string | undefined;
    discordUserId: string;
    guildId: string | null;
};

export async function UPDATE_DISCORD_MESSAGE(value: string) {
    if (ROULETTE_ROUND === null) return;
    if (discordBotStatus !== 'READY') return;

    for (let i = 0; i < ROULLETE.GUILDS.length; i++) {
        const GUILD = ROULLETE.GUILDS[i];
        const TargetedChannel = (await discord.channels.fetch(GUILD.BETTING_CHANNEL_ID)) as any;
        if (ROULETTE_ROUND && CURRENT_ROUND !== ROULETTE_ROUND.id) {
            CURRENT_ROUND = ROULETTE_ROUND.id;

            let stillStuffToPurge = true;
            while (stillStuffToPurge) {
                const response = await TargetedChannel.bulkDelete(100);
                if (response.size === 0) {
                    stillStuffToPurge = false;
                }
            }
            const newImageMessage = await TargetedChannel.send(`https://files.talke.dev/roulette/table.png`);
            GUILD.BETTING_IMAGE_MESSAGE_ID = newImageMessage.id;

            const newTextMessage = await TargetedChannel.send(value);
            GUILD.BETTING_TEXT_MESSAGE_ID = newTextMessage.id;
        }

        const targetImageMessage = await TargetedChannel.messages.resolve(GUILD.BETTING_IMAGE_MESSAGE_ID);
        if (targetImageMessage && ROULETTE_ROUND && ROULETTE_ROUND.winningNumber) {
            await targetImageMessage.edit(`https://files.talke.dev/roulette/result-${ROULETTE_ROUND.winningNumber}.png`);
        }

        const targetTextMessage = await TargetedChannel.messages.resolve(GUILD.BETTING_TEXT_MESSAGE_ID);
        if (targetTextMessage) {
            await targetTextMessage.edit(value);
        }
    }
}

export async function DUMP_TO_HISTORY() {
    let message = `**Round Details**
\`\`\`
ROUND #:           ${ROULETTE_ROUND?.id || '-'}
DRAWN #:           ${ROULETTE_ROUND?.winningNumber || '-'}
PLAYERS:           ${ROULETTE_PLAYERS.length}
BETS:              ${ROULETTE_ROUND_BETS.length}
\`\`\`
`;

    if (ROULETTE_PLAYERS.length !== 0 && ROULETTE_ROUND_BETS.length !== 0) {
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

    for (let i = 0; i < ROULLETE.GUILDS.length; i++) {
        const GUILD = ROULLETE.GUILDS[i];
        const TargetedChannel = (await discord.channels.fetch(GUILD.HISTORY_CHANNEL_ID)) as any;

        await TargetedChannel.send(`https://files.talke.dev/roulette/result-${ROULETTE_ROUND?.winningNumber}.png`);
        await TargetedChannel.send(message);
    }
}

export function GENERATE_PLAYER_BETS() {
    const betsByPlayer = _.sortBy(ROULETTE_ROUND_BETS, 'playerId');
    const t = new Table();

    for (let i = 0; i < betsByPlayer.length; i++) {
        const betByPlayer = betsByPlayer[i];
        const player = ROULETTE_PLAYERS.find((player) => player.id === betByPlayer.playerId);
        t.cell('#', betByPlayer.id);
        t.cell('Player', player?.name);
        t.cell('Bet', BETTING_TRANSLATIONS[betByPlayer.bet]);
        t.cell('Amount', formatMoney(betByPlayer.amount));
        t.cell('Potential', formatMoney(betByPlayer.amount * BETTING_PAYOUTS[betByPlayer.bet]));
        t.cell('Status', betByPlayer.state);
        t.newRow();
    }

    if (betsByPlayer.length > 0) return t.toString();

    return 'No Player Bets Yet...';
}

export function GENERATE_PLAYERS() {
    const t = new Table();
    for (let i = 0; i < ROULETTE_PLAYERS.length; i++) {
        const player = ROULETTE_PLAYERS[i];
        t.cell('#', player.id);
        t.cell('Player', player?.name);
        t.cell('Available Funds', formatMoney(player.availableFunds));
        if (player.fundsAtRisk && !ROULETTE_ROUND?.winningNumber) {
            t.cell('Funds At Risk', formatMoney(player.fundsAtRisk));
        }
        if (player.fundsAtRisk && ROULETTE_ROUND?.winningNumber) {
            t.cell('Funds Risked', formatMoney(player.fundsAtRisk));
        }
        if (ROULETTE_ROUND?.winningNumber && player.positionChange) {
            t.cell('Position Change', formatMoney(player.positionChange));
        }
        t.newRow();
    }

    if (ROULETTE_PLAYERS.length > 0) return t.toString();

    return 'No Players Yet...';
}

export async function SEND_DISCORD_MESSAGE(discordIds: DISCORD_IDS, message: string) {
    const { targetChannelKey, targetChannelId, discordUserId, guildId } = discordIds;

    const GUILD = CONFIG.DISCORD_BOT.PLUGINS.ROULLETE.GUILDS.find((registeredGuild) => registeredGuild.GUILD_ID === guildId);
    if (GUILD === undefined) return;
    const targechannel = (await discord.channels.fetch(targetChannelId || GUILD[targetChannelKey as keyof Guild])) as any;

    if (targechannel === null) return;
    targechannel.send(`<@${discordUserId}> ${message}`);
}

discord.on('messageCreate', async (message) => {
    const [cmd, ...rest] = message.content.split(' ');
    const { author, guildId, channelId } = message;

    const targetGuild = CONFIG.DISCORD_BOT.PLUGINS.ROULLETE.GUILDS.find((registeredGuild) => registeredGuild.GUILD_ID === guildId);
    if (channelId === targetGuild?.BETTING_CHANNEL_ID) {
        if (cmd === '!join') {
            await JOIN_PLAYER_TO_ROULETTE_ROUND(author.id, message);
            logger.info(`Player (ID: '${author.id}') has been registered against this round.`);
        }

        if (cmd === '!gamble') {
            const [amount, bet] = rest;
            PROCESS_ROULETTE_BET(message, {
                amount,
                bet,
            });
        }

        if (cmd === '!dump') {
            const message = `\n\`\`\`${JSON.stringify({ ROULETTE_ROUND, ROULETTE_PLAYERS, ROULETTE_ROUND_BETS }, null, 2)}\`\`\``;
            SEND_DISCORD_MESSAGE({ discordUserId: author.id, targetChannelId: channelId, targetChannelKey: '', guildId: guildId }, message);
        }
    }
});
