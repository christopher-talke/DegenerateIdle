import { Message } from 'discord.js';

import { discord } from '../../../discord/bot';
import { CONFIG } from '../../../config';
import { TRANSFER_FUNDS } from '../logic/bank';
import logger from '../../../utils/logger';
import { BankAccount } from '@prisma/client';
import { formatMoney } from '../../../utils/utilities';

discord.on('messageCreate', async (message : Message) => {
    const [cmd] = message.content.split(' ');
    const { guildId, channelId } = message;

    const targetGuild = CONFIG.DISCORD_BOT.PLUGINS.ROULLETE.GUILDS.find((registeredGuild) => registeredGuild.GUILD_ID === guildId);
    if (channelId === targetGuild?.BANKING_CHANNEL_ID) {
        switch (cmd) {
            case '!transfer':
                await TRANSFER_FUNDS(message)
                break;
            default:
                break;
        }
    }
});

export async function TRANSFER_MESSAGE_COMPLETE(message: Message, transferAmount: number, sourceAccount: BankAccount, targetAccount: BankAccount, playerToPlayer: boolean = false) {

    let messageToSend = '\n\n**Transfer Complete**\n' + 
                          '```\n' +
                          `Transfer Amount:        ${formatMoney(transferAmount)}\n` + 
                          `Source Account:         ${formatMoney(sourceAccount.amount)}\n` + 
                          `Target Account:         ${formatMoney(targetAccount.amount)}\n` + 
                          '```';

    if (playerToPlayer) {
        messageToSend += `\n\n<@${message.mentions.users.first()?.id}> you have just been paid by <@${message.author.id}>!`
    }

    await SEND_BANK_MESSAGE(message, messageToSend);
}

export enum BANK_TRANSFER_ENUM {
    INCORRECT_AMOUNT = 'INCORRECT_AMOUNT',
    ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
    INSUFFICENT_FUNDS = 'INSUFFICENT_FUNDS',
    BUSY = 'BUSY',
}

export async function TRANSFER_MESSAGE_ERROR(message: Message, errorType: BANK_TRANSFER_ENUM, additionalInformation : string = '') {

    let messageToSend = '\n\n**Transfer Error**\n';
    if (errorType === 'ACCOUNT_NOT_FOUND') {
        messageToSend += '```\n' +
                         `Please see below info for what went wrong:\n` +
                         `- ${additionalInformation}\n` +
                         '```';
    }

    if (errorType === 'INSUFFICENT_FUNDS') {
        messageToSend += '```\n' +
                         `Please see below info for what went wrong:\n` +
                         `- ${additionalInformation}\n` +
                         '```';
    }

    if (errorType === 'INCORRECT_AMOUNT') {
        messageToSend += '```\n' +
                         `Please see below info for what went wrong:\n` +
                         `- ${additionalInformation}\n` +
                         '```';
    }

    if (errorType === 'BUSY') {
        messageToSend += '```\n' +
                         `Please see below info for what went wrong:\n` +
                         `- ${additionalInformation}\n` +
                         '```';
    }

    await SEND_BANK_MESSAGE(message, messageToSend);
    
    return;
}

export async function SEND_BANK_MESSAGE(discordMessage: Message, message: string) {
    try {
        const guildId = discordMessage.guildId;
        const targetChannelId = discordMessage.channelId;
        const discordUserId = discordMessage.author.id;

        const GUILD = CONFIG.DISCORD_BOT.PLUGINS.ROULLETE.GUILDS.find((registeredGuild) => registeredGuild.GUILD_ID === guildId);
        if (GUILD === undefined) return;
        const targechannel = (await discord.channels.fetch(targetChannelId)) as any;
    
        if (targechannel === null) return;
        targechannel.send(`<@${discordUserId}> ${message}\n\n`);
    }
    
    catch (error) {
        logger.error(JSON.stringify(error));
        logger.error(`There was an issue sending an update to the Banking Discord channel.`)
    }
}