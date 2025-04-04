
import { Message } from "discord.js"
import { prisma } from "../../../prisma/client"
import { DrugwarsPlayer } from "../types/drugwars"
import { REGISTER_PLAYER } from "../../player/logic/registerPlayer";


/**
 * Registers a new player in the database and creates a starter drug empire for them
 * @param message 
 * @param targetGuild 
 */
export async function CREATE_DRUG_EMPIRE(message: Message, targetGuild: ) {

    let playerData = await prisma.player.findFirst({
        where: {
            discordId: message.author.id,
        },
        include: {
            BankAccount: {
                orderBy: {
                    id: 'asc'
                }
            }
        }
    }) as DrugwarsPlayer;

    if (playerData === undefined) {
        playerData = await REGISTER_PLAYER(message.author.id, message.author.username) as unknown as DrugwarsPlayer;
    }



}