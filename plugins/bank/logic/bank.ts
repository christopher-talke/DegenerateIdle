import { Message } from "discord.js";
import { prisma } from "../../../prisma/client";
import logger from "../../../utils/logger";
import { formatMoney, handleFloat } from "../../../utils/utilities";
import { ROULETTE_PLAYERS } from "../../roulette/logic";
import { BANK_TRANSFER_ENUM, TRANSFER_MESSAGE_COMPLETE, TRANSFER_MESSAGE_ERROR } from "../discord/bank";
import { BankAccountExt } from "../types/bank";
import { BankAccountType } from "@prisma/client";

export async function BANK_ACCOUNT_ADD_FUNDS(accountId : number, amountToAdd: number) {

    try {
        logger.info(`Attemping to add amount (AMOUNT ${amountToAdd}) to account (ID ${accountId}).`)
      
        const accountToUpdate = await prisma.bankAccount.findUnique({
            where: {
                id: accountId
            },
        }) as BankAccountExt

        if (accountToUpdate === null) {
            logger.error(`The account (ID ${accountId}) could not be found.`)
            return null;
        };
        
        let newAmount = accountToUpdate.amountAsNumber + amountToAdd;

        logger.info(`Updating bank account amount from (AMOUNT ${accountToUpdate.amountAsNumber}) to (AMOUNT ${newAmount}).`);
        const updatedAccount = await prisma.bankAccount.update({
            where: {
                id: accountId
            },
            data : {
                amount : `${newAmount}`
            }
        }) as BankAccountExt
        
        logger.info(`Succesfully updated account (ID ${accountId}), new amount (AMOUNT ${accountToUpdate.amountAsNumber}) has been processed.`);
        return updatedAccount
    } 
    
    catch (error) {
        logger.error(`There was an issue adding amount to account (ID ${accountId}).`)
        console.error(error);
        return null;
    }

}

export async function BANK_ACCOUNT_REMOVE_FUNDS(accountId : number, amountToRemove: number) {

    try {
        logger.info(`Attemping to add amount (AMOUNT ${amountToRemove}) to account (ID ${accountId}).`)
      
        const accountToUpdate = await prisma.bankAccount.findUnique({
            where: {
                id: accountId
            },
        }) as BankAccountExt

        if (accountToUpdate === null) {
            logger.error(`The account (ID ${accountId}) could not be found.`)
            return null;
        };
        
        let newAmount = accountToUpdate.amountAsNumber - amountToRemove;
        logger.info(`Updating bank account amount from (AMOUNT ${accountToUpdate.amountAsNumber}) to (AMOUNT ${newAmount}).`);
        const updatedAccount = await prisma.bankAccount.update({
            where: {
                id: accountId
            },
            data : {
                amount : `${newAmount}`
            }
        }) as BankAccountExt
        
        logger.info(`Succesfully updated account (ID ${accountId}), new amount (AMOUNT ${updatedAccount.amountAsNumber}) has been processed..`);
        return updatedAccount
    } 
    
    catch (error) {
        logger.error(`There was an issue adding amount to account (ID ${accountId}).`)
        console.error(error);
        return null;
    }

}

export async function TRANSFER_FUNDS(message: Message) {
    const isPlayerBusy = ROULETTE_PLAYERS.find(player => player.discordId === message.author.id);

    if (isPlayerBusy) {
        logger.error(`Player '${message.author.username}' is busy gambling right now, transfers cannot be made whilst busy.`);
        await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.BUSY, `It looks like you are busy gambling at this moment and cannot make transfers.`);
        return;
    }

    const transferType = DETERMINE_TRANSFER_TYPE(message)
    switch (transferType) {
        case 'PLAYER_TO_PLAYER':
            await PLAYER_TRANSFER(message);
            break;
        case  'ACCOUNT_TO_ACCOUNT':
            await ACCOUNT_TRANSFER(message);
            break;
        default:
            break;
    }
  
    return;
}

function DETERMINE_TRANSFER_TYPE(message: Message) {
    if (message.mentions.users.size > 0) return 'PLAYER_TO_PLAYER'
    return 'ACCOUNT_TO_ACCOUNT'
}


/**
 * A transfer between two players
 */
async function PLAYER_TRANSFER(message: Message) {

    // @ts-ignore
    const [cmd, amount, player] = message.content.split(' ');

    const transferAmount = handleFloat(amount) * 100;
    if (transferAmount > 0) {
        logger.info(`Starting an 'PLAYER_TO_PLAYER' transfer (SOURCE ID '${message.author.id}') -> (TARGET ID '${message.mentions.users.first()?.id}') for an amount of '${formatMoney(transferAmount)}'  (RAW AMOUNT '${transferAmount}').`);

        // Get the source bank account
        const sourceBankAccount = await prisma.bankAccount.findFirst({
            where: {
                Player: {
                  discordId: message.author.id  
                },
                type : 'SPENDINGS'
            }
        }) as BankAccountExt

        if (!sourceBankAccount) {
            logger.error(`Source account for '${message.author.username}' could not be found.`);
            await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.ACCOUNT_NOT_FOUND, `Spendings account for '${message.author.username}' could not be found.`);
            return;
        };
        if (sourceBankAccount.amountAsNumber < transferAmount) {
            logger.error(`Source account for '${message.author.username}' did not have sufficent funds to complete this transfer.`);
            await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.INSUFFICENT_FUNDS, `It looks like you do not have sufficent funds to complete this transfer.`);
            return;
        };

        // Get the target bank account
        const targetBankAccount = await prisma.bankAccount.findFirst({
            where: {
                Player: {
                  discordId: message.mentions.users.first()?.id 
                },
                type : 'SPENDINGS'
            }
        }) as BankAccountExt

        if (!targetBankAccount) {
            logger.error(`Target account for '${message.mentions.users.first()?.username}' could not be found.`);
            await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.ACCOUNT_NOT_FOUND, `Spendings account for '${message.mentions.users.first()?.username}' could not be found.`);
            return;
        };

        // Complete the Transfer
        await BANK_ACCOUNT_REMOVE_FUNDS(sourceBankAccount.id, transferAmount);
        await BANK_ACCOUNT_ADD_FUNDS(targetBankAccount.id, transferAmount);

        // Write Transaction to Database
        await prisma.bankAccountTransaction.create({
            data: {
                amount : `${transferAmount}`,
                Player : {
                    connect: {
                        id: sourceBankAccount.playerId
                    }
                },
                SourceAccount : {
                    connect : {
                        id: sourceBankAccount.id
                    }
                },
                TargetAccount: {
                    connect : {
                        id: targetBankAccount.id
                    }
                },
            }
        })

        await TRANSFER_MESSAGE_COMPLETE(message, transferAmount, sourceBankAccount, targetBankAccount, true)

        logger.info(`Completed an 'PLAYER_TO_PLAYER' transfer (SOURCE ID '${message.author.id}') -> (TARGET ID '${message.mentions.users.first()?.id}') for an amount of '${formatMoney(transferAmount)}' (RAW AMOUNT '${transferAmount}').`);
        return;
    } else {
        logger.error(amount)
        await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.INCORRECT_AMOUNT, `It looks like you tried to transfer an incorrect value, please stop.`);
        return;
    }
}

/**
 * A transfer between two account identifiers...
 */
async function ACCOUNT_TRANSFER(message: Message) {

    // @ts-ignore
    const [ cmd, sourceAccount, targetAccount, amount ] = message.content.split(' ');

    const transferAmount = handleFloat(amount) * 100;
    if (transferAmount > 0) {
        logger.info(`Starting an 'ACCOUNT_TO_ACCOUNT' transfer (SOURCE ID '${sourceAccount}') -> (TARGET ID '${targetAccount}') for an amount of '${formatMoney(transferAmount)}' (RAW AMOUNT '${transferAmount}').`);

        // Get the source bank account
        const sourceBankAccount = await prisma.bankAccount.findFirst({
            where: {
                id: Number(sourceAccount)
            }
        }) as BankAccountExt

        
        if (!sourceBankAccount) {
            logger.error(`Source account '${sourceAccount}' could not be found.`);
            await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.ACCOUNT_NOT_FOUND, `Source account '${sourceAccount}' could not be found.`);
            return;
        };
        
        if (sourceBankAccount.amountAsNumber < transferAmount) {
            logger.error(`Source account '${targetAccount}' did not have sufficent funds to complete this transfer.`);
            await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.INSUFFICENT_FUNDS, `It looks like you do not have sufficent funds to complete this transfer.`);
            return;
        };

        // Get the target bank account
        const targetBankAccount = await prisma.bankAccount.findFirst({
            where: {
                id: Number(targetAccount)
            }
        }) as BankAccountExt

        if (!targetBankAccount) {
            logger.error(`Target account '${targetAccount}' could not be found.`);
            await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.ACCOUNT_NOT_FOUND, `Target account '${targetAccount}' could not be found.`);
            return;
        };

        // Complete Transfer
        sourceBankAccount.amountAsNumber = sourceBankAccount.amountAsNumber - transferAmount;
        targetBankAccount.amountAsNumber = targetBankAccount.amountAsNumber + transferAmount;

        // Write Transfer to Database
        await BANK_ACCOUNT_REMOVE_FUNDS(sourceBankAccount.id, transferAmount);
        await BANK_ACCOUNT_ADD_FUNDS(targetBankAccount.id, transferAmount);

        // Write Transaction to Database
        await prisma.bankAccountTransaction.create({
            data: {
                amount : `${transferAmount}`,
                Player : {
                    connect: {
                        id: sourceBankAccount.playerId
                    }
                },
                SourceAccount : {
                    connect : {
                        id: sourceBankAccount.id
                    }
                },
                TargetAccount: {
                    connect : {
                        id: targetBankAccount.id
                    }
                },
            }
        })

        await TRANSFER_MESSAGE_COMPLETE(message, transferAmount, sourceBankAccount, targetBankAccount, false)

        logger.info(`Completed an 'ACCOUNT_TO_ACCOUNT' transfer (SOURCE ID '${sourceAccount}') -> (TARGET ID '${targetAccount}') for an amount of '${formatMoney(transferAmount)}' (RAW AMOUNT '${transferAmount}').`);
        return;
    } else {
        logger.error(amount)
        await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.INCORRECT_AMOUNT, `It looks like you tried to transfer an incorrect value, please stop.`);
        return;
    }
}

export async function PROCESS_LOAN_REQUEST(message: Message) {

    const [ _cmd, amount ] = message.content.split(' ');
    const loanAmount = handleFloat(amount) * 100;
    if (loanAmount > 0) {
        logger.info(`Starting a loan request for an amount of '${formatMoney(loanAmount)}' (RAW AMOUNT '${loanAmount}').`);

        const player = await prisma.player.findFirst({
            where: {
                discordId: message.author.id  
            }
        });

        // Get the target bank account
        const targetBankAccount = await prisma.bankAccount.findFirst({
            where: {
                Player: {
                    discordId: message.mentions.users.first()?.id 
                },
                type : 'SPENDINGS'
            }
        }) as BankAccountExt

        if (!targetBankAccount) {
            logger.error(`Target account for '${message.mentions.users.first()?.username}' could not be found.`);
            await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.ACCOUNT_NOT_FOUND, `Spendings account for '${message.mentions.users.first()?.username}' could not be found.`);
            return;
        };

        // Complete the Transfer
        await BANK_ACCOUNT_ADD_FUNDS(targetBankAccount.id, loanAmount);

        let loanAccount = await prisma.bankAccount.findFirst({
            where: {
                Player: {
                    discordId: message.author.id  
                },
                type : BankAccountType.LOAN
            }
        }) as BankAccountExt

        if (!loanAccount) {
            loanAccount = await prisma.bankAccount.create({
                data: {
                    Player: {
                        connect: {
                            id: player?.id
                        }
                    },
                    type: BankAccountType.LOAN,
                    amount: `${loanAmount}`
                }
            }) as BankAccountExt
        }

        else {

            if (loanAccount.amountAsNumber < -10000) {
                await prisma.bankAccount.update({
                    where: {
                        id: loanAccount.id
                    },
                    data: {
                        amount: `${loanAccount.amountAsNumber + loanAmount}`
                    }
                }) as BankAccountExt;
            } 
            
            else {
                await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.LOAN_MAXED, `It looks like you've maxed out your line of credit, you need to payback what you owe first.`);
                return;
            }

        }

    }
}

export async function PROCESS_LOAN_REPAYMENT(message: Message) {

    const [ _cmd, amount ] = message.content.split(' ');
    const loanAmount = handleFloat(amount) * 100;
    if (loanAmount < 0) {
        logger.info(`Starting a loan repayment for an amount of '${formatMoney(loanAmount)}' (RAW AMOUNT '${loanAmount}').`);

        // Get the source bank account
        const sourceBankAccount = await prisma.bankAccount.findFirst({
            where: {
                Player: {
                    discordId: message.author.id  
                },
                type : 'SPENDINGS'
            }
        }) as BankAccountExt

        // Get the target bank account
        const targetBankAccount = await prisma.bankAccount.findFirst({
            where: {
                Player: {
                  discordId: message.author.id  
                },
                type : BankAccountType.LOAN
            }
        }) as BankAccountExt

        if (!targetBankAccount) {
            logger.error(`Target account for '${message.author.username}' could not be found.`);
            await TRANSFER_MESSAGE_ERROR(message, BANK_TRANSFER_ENUM.ACCOUNT_NOT_FOUND, `Spendings account for '${message.author.username}' could not be found.`);
            return;
        };

        // Complete the Transfer
        await BANK_ACCOUNT_REMOVE_FUNDS(sourceBankAccount.id, loanAmount);
        await BANK_ACCOUNT_ADD_FUNDS(targetBankAccount.id, loanAmount);

        await prisma.bankAccountTransaction.create({
            data: {
                amount : `${loanAmount}`,
                Player : {
                    connect: {
                        id: sourceBankAccount.playerId
                    }
                },
                SourceAccount : {
                    connect : {
                        id: sourceBankAccount.id
                    }
                },
                TargetAccount: {
                    connect : {
                        id: targetBankAccount.id
                    }
                },
            }
        })

        await TRANSFER_MESSAGE_COMPLETE(message, loanAmount, sourceBankAccount, targetBankAccount, false);
    }
}