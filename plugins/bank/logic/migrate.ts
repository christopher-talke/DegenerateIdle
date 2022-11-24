import { prisma } from "../../../prisma/client"
import logger from "../../../utils/logger";

const MIGRATE_FROM_PLAYER_TO_ACCOUNT = async () => {
    logger.section('Starting PLAYER_TO_ACCOUNT migration...')

    try {
        const players = await prisma.player.findMany();
        if (players.length === 0) return;

        logger.info(`There was a total of '${players.length}' pulled from the database.`)
        for (let i = 0; i < players.length; i++) {
            const player = players[i];

            const playersAccounts = await prisma.bankAccount.findMany({
                where: {
                    playerId : player.id
                }
            })

            if (playersAccounts.length === 0) {

                logger.info(`Player (ID ${player.id}) did not have bank accounts, creating them now...`)
                await prisma.bankAccount.create({
                    data : {
                        name : 'Spendings',
                        status : "OPEN",
                        type : "SPENDINGS",
                        amount : player.z_availableFunds,
                        Player : {
                            connect : {
                                id : player.id
                            }
                        },
                    }
                })

                await prisma.bankAccount.create({
                    data : {
                        name : 'Savings',
                        status : "OPEN",
                        type : "SAVINGS",
                        amount : 0,
                        Player : {
                            connect : {
                                id : player.id
                            }
                        },
                    }
                })

                logger.info(`Player (ID ${player.id}) now has new bank accounts...`)

            } else {
                logger.info(`Player (ID ${player.id}) already has the necessary accounts...`)
            }
            
        }

    } 
    
    catch (error) {
        logger.error(JSON.stringify(error))
        logger.info('There was an issue moving player funds from Player Entity to Bank Accounts.')
    }


    logger.section('Finished PLAYER_TO_ACCOUNT migration...')
}

MIGRATE_FROM_PLAYER_TO_ACCOUNT();