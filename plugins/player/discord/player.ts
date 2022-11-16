import { Message } from 'discord.js';
import { Player } from '@prisma/client';

import { discord } from '../../../discord/bot';
import { CONFIG } from '../../../config';
import { ROULETTE_PLAYERS } from '../../roulette/logic';
import { prisma } from '../../../prisma/client';
import { formatMoney } from '../../../utils/utilities';

async function GET_PLAYER_INFO(discordMessage: Message) {
    let player = null as null | Player;

    const CACHE = ROULETTE_PLAYERS.find((player) => player.discordId === discordMessage.author.id);
    if (CACHE === undefined) {
        player = await prisma.player.findFirst({
            where: {
                discordId: discordMessage.author.id,
            },
        });
    } else {
        player = CACHE;
    }

    if (!player) return;

    const targetChannel = (await discord.channels.fetch(discordMessage.channelId)) as any;
    const message = `<@${discordMessage.author.id}> here are your details:\`\`\`\n
Available Funds:        ${formatMoney(player?.availableFunds)}
\`\`\``;
    await targetChannel.send(message);
}

discord.on('messageCreate', async (message) => {
    const [cmd] = message.content.split(' ');
    const { guildId, channelId } = message;

    const targetGuild = CONFIG.DISCORD_BOT.PLUGINS.ROULLETE.GUILDS.find((registeredGuild) => registeredGuild.GUILD_ID === guildId);
    if (channelId === targetGuild?.BETTING_CHANNEL_ID) {
        if (cmd === '!me') {
            await GET_PLAYER_INFO(message);
        }
    }
});
