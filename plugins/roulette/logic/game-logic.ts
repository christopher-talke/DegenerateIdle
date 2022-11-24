import { RoulettePlayState, RoulettePlay } from '@prisma/client';
import { prisma } from '../../../prisma/client';

export async function CREATE_NEW_ROULETTE_ROUND() {
    try {
        await CLEAR_ZOMBIE_MATCHES();
        const createdRouletteRound = await prisma.roulettePlay.create({
            data: {
                state: RoulettePlayState.PENDING,
            },
        });

        return createdRouletteRound;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function CLEAR_ZOMBIE_MATCHES(): Promise<null> {
    try {
        await prisma.roulettePlay.deleteMany({
            where: {
                state: {
                    not: 'FINAL',
                },
            },
        });
    } catch (error) {
        console.error(error);
    }
    return null;
}

export async function PLAY_ROULETTE_ROUND(rouletteRoundData: RoulettePlay): Promise<RoulettePlay> {
    rouletteRoundData && (rouletteRoundData.winningNumber = Math.floor(Math.random() * 36));
    return rouletteRoundData;
}

export async function UPDATE_ROULETTE_ROUND(rouletteRoundData: RoulettePlay) {
    if (rouletteRoundData === null) return null;

    try {
        const updatedRouletteRound = await prisma.roulettePlay.update({
            where: {
                id: rouletteRoundData.id,
            },
            data: rouletteRoundData as any,
        });
        return updatedRouletteRound;
    } catch (error) {
        console.error(error);
        return null;
    }
}
