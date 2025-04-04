import { Message } from 'discord.js';

import { discord } from '../../../discord/bot';
import { CONFIG } from '../../../config';
import { ROULETTE_PLAYERS } from '../../roulette/logic';
import { prisma } from '../../../prisma/client';
import { formatMoney } from '../../../utils/utilities';
import Table from 'easy-table';

import { RoulettePlayer } from '../../player/types/player'

async function GET_PLAYER_INFO(discordMessage: Message, anotherPlayer: boolean = false) {
    let player = null as null | RoulettePlayer

    const CACHE = ROULETTE_PLAYERS.find((player) => player.discordId === discordMessage.author.id);
    if (CACHE === undefined && anotherPlayer === false) {
        player = await prisma.player.findFirst({
            where: {
                discordId: discordMessage.author.id,
            },
            include : {
                BankAccount : {
                    orderBy : {
                        id : 'asc'
                    }
                }
            }
        }) as RoulettePlayer;
    } else if (discordMessage.mentions.users.first() && anotherPlayer) {
        player = await prisma.player.findFirst({
            where: {
                discordId: discordMessage.mentions.users.first()?.id,
            },
            include : {
                BankAccount : {
                    orderBy : {
                        id : 'asc'
                    }
                }
            }
        }) as RoulettePlayer;
    } else {
        player = CACHE as RoulettePlayer
    }

    const targetChannel = (await discord.channels.fetch(discordMessage.channelId)) as any;
    if (!player) {
        await targetChannel.send(`<@${discordMessage.author.id}> we couldn't find player details for <@${discordMessage.mentions.users.first()?.id}>`);
        return;
    };


    const t = new Table();
    for (let i = 0; i < player.BankAccount.length; i++) {
        const bankAccount = player.BankAccount[i];
        t.cell('#', bankAccount.id);
        t.cell('Type', bankAccount.type);
        t.cell('Amount', formatMoney(bankAccount.amountAsNumber));
        t.newRow();
    }

    const message = `<@${discordMessage.author.id}> here are your details:\n\n` + 
                    '**Bank Accounts**\n' +
                    '```\n' +
                    `${t.toString() || 'No accounts...'}\n` + 
                    '```';
    await targetChannel.send(message);
}

discord.on('messageCreate', async (message) => {
    const [cmd] = message.content.split(' ');
    const { guildId, channelId } = message;

    const targetGuild = CONFIG.DISCORD_BOT.PLUGINS.ROULLETE.GUILDS.find((registeredGuild) => registeredGuild.GUILD_ID === guildId);
    console.log('targetGuild', targetGuild)
    if (targetGuild) {
        const { BETTING_CHANNEL_ID, WONDERWHEEL_CHANNEL_ID, BANKING_CHANNEL_ID } = targetGuild;

        const WHITELISTED_CHANNELS = [ BETTING_CHANNEL_ID, WONDERWHEEL_CHANNEL_ID, BANKING_CHANNEL_ID ];
        if (WHITELISTED_CHANNELS.includes(`${channelId}`)) {
            if (cmd === '!me') {
                await GET_PLAYER_INFO(message);
            }
            if (cmd === '!player_info') {
                await GET_PLAYER_INFO(message, true)
            }
        }
    }
});
