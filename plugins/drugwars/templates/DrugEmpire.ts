import DrugWars from "../types/drugwars";

export const DRUG_EMPIRE_TEMPLATE = {
    player: null,
    drugs: new Record(),
    locations: new Record(),
    currentDay: 0,
    maxDays: 30,
    events: new Record()
} as DrugWars.GameState;