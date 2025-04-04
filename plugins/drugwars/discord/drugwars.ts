import { discord } from '../../../discord/bot';
import { CONFIG } from '../../../config';

discord.on('messageCreate', async (message) => {
    const [cmd] = message.content.split(' ');
    const { guildId, channelId } = message;

    const targetGuild = CONFIG.DISCORD_BOT.PLUGINS.DRUGWARS.GUILDS.find((registeredGuild) => registeredGuild.GUILD_ID === guildId);
    if (targetGuild) {
        const { DRUGWARS_CHANNEL_ID } = targetGuild;

        if (channelId === DRUGWARS_CHANNEL_ID) {

            if (cmd === '!dw:start') {
                await CREATE_DRUG_EMPIRE(message, targetGuild);
            }

            if (cmd === '!dw:end') {
                await DELETE_DRUG_EMPIRE(message, targetGuild);
            }

        }
    }
});
