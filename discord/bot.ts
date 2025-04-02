import { CategoryChannel, ChannelType, Client } from 'discord.js';
import { CONFIG } from '../config';

const discord = new Client({ intents: [...CONFIG.DISCORD_BOT.INTENTS] });
let discordBotStatus = 'NOT_READY';

discord.once('ready', (client: Client) => {
    discordBotStatus = 'READY';

    console.log(`Ready! Logged in as ${client?.user?.tag}`);
});

discord.login(CONFIG.DISCORD_BOT.TOKEN);

export { discord, discordBotStatus };
