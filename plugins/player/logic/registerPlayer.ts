import { prisma } from '../../../prisma/client';
import logger from '../../../utils/logger';
import { RoulettePlayer } from '../types/player';

export async function REGISTER_PLAYER(discordId: string, discordUsername: string) {
    try {
        const newPlayerData = await prisma.player.create({
            data: {
                name: discordUsername,
                discordId,
                BankAccount : {
                    createMany : {
                        data : [{
                            name : 'Spendings',
                            status : "OPEN",
                            type : "SPENDINGS",
                            amount : 100000,
                        },{
                            name : 'Savings',
                            status : "OPEN",
                            type : "SAVINGS",
                            amount : 0,
                        }]
                    }
                }
            },
        });

        const playerData = await prisma.player.findFirst({
            where: {
                id: newPlayerData.id
            },
            include: {
                BankAccount : {
                    where : {
                        type: 'SPENDINGS'
                    }
                }
            }
        }) as RoulettePlayer

        return playerData;
    } catch (error) {
        logger.error(JSON.stringify(error));
        return null;
    }
}
