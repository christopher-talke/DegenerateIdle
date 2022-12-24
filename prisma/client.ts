import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export { prisma };

prisma.$use(async (params, next) => {
    
    const actionWhitelist = ['findFirst', 'findMany', 'findUnique', 'create', 'createMany'];
    if (actionWhitelist.includes(params.action)) {

        const modelWhitelist = [ "Player", "RoulettePlayerBet", "WonderwheelPlay", "BankAccount", "BankAccountTransaction" ];
        if (params.model && modelWhitelist.includes(params.model)) {

            let result = await next(params);
            if (Array.isArray(result) && result.length > 0) {
                for (let i = 0; i < result.length; i++) {
                    let payload = result[i];
                    if (payload) {

                        payload.amountAsNumber = Number(payload.amount)
                        
                        Object.keys(payload).forEach(key => {
                            if (modelWhitelist.includes(key)) {
                                (innerConvert(payload[key]))
                            }
                        })
                        
                    }

                }
            } 
            
            else {
                if (result) {
                    result.amountAsNumber = Number(result.amount)
                    Object.keys(result).forEach(key => {
                        if (modelWhitelist.includes(key)) {
                            (innerConvert(result[key]))
                        }
                    })
                }
            }

            return result
        }
    }
  
    return next(params)
})

function innerConvert(payload : any) {
    if (Array.isArray(payload) && payload.length > 0) {
        for (let i = 0; i < payload.length; i++) {
            let innerPayload = payload[i]
            innerPayload.amountAsNumber = Number(innerPayload.z_availableFunds || innerPayload.amount)
        }
    } else {
        payload.amountAsNumber = Number(payload.amount)
    }
}