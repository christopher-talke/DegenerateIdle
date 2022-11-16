import { prisma } from '../../../prisma/client';
import logger from '../../../utils/logger';

export async function REGISTER_PLAYER(discordId: string, discordUsername: string) {
    try {
        const playerData = prisma.player.create({
            data: {
                name: discordUsername,
                availableFunds: 100000,
                discordId,
            },
        });

        return playerData;
    } catch (error) {
        logger.error(error);
        return null;
    }
}
