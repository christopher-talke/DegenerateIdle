import { prisma } from '@prisma';

async function CREATE_NEW_ROULETTE_ROUND(): Promise<null> {
    try {
        await CLEAR_ZOMBIE_MATCHES();
        const createdRouletteRound = await prisma.roulettePlay.create({
            data: {
                state: 'PENDING',
            },
        });

        return createdRouletteRound;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function CLEAR_ZOMBIE_MATCHES(): Promise<null> {
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

async function PLAY_ROULETTE_ROUND(rouletteRoundData): Promise<any> {
    rouletteRoundData.winningNumber = Math.floor(Math.random() * 36);
    return rouletteRoundData;
}

async function UPDATE_ROULETTE_ROUND(rouletteRoundData) {
    try {
        const updatedRouletteRound = await prisma.roulettePlay.update({
            where: {
                id: rouletteRoundData.id,
            },
            data: rouletteRoundData,
        });
        return updatedRouletteRound;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export { CREATE_NEW_ROULETTE_ROUND, PLAY_ROULETTE_ROUND, UPDATE_ROULETTE_ROUND };
