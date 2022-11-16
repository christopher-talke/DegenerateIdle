import { discord } from '../../../discord/bot';
import { CONFIG } from '../../../config';
import { PLAY_WONDERWHEEL } from '../logic/wonderwheel';

discord.on('messageCreate', async (message) => {
    const [cmd] = message.content.split(' ');
    const { guildId, channelId } = message;

    const targetGuild = CONFIG.DISCORD_BOT.PLUGINS.ROULLETE.GUILDS.find((registeredGuild) => registeredGuild.GUILD_ID === guildId);
    if (channelId === targetGuild?.WONDERWHEEL_CHANNEL_ID) {
        if (cmd === '!spin') {
            await PLAY_WONDERWHEEL(message);
        }
    }
});
