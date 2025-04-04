export interface DrugwarsPlayer extends Player {
    inventory: Inventory;
    health: number;
    reputation: number;
    wantedLevel: number;

    employees: Employee[];
    BankAccount : BankAccountExt[];
}

declare namespace DrugWars {

    interface Drug {
        id: string;
        name: string;
        basePrice: number;
        volatility: number;
        minPrice?: number;
        maxPrice?: number;
    }

    interface Location {
        id: string;
        name: string;
        dangerLevel: number;
        events?: string[];
        priceModifiers: Record<string, number>;
        employees: Employee[];
    }

    interface Inventory {
        capacity: number;
        drugs: Record<string, number>;
    }

    interface Employee {
        id: string;
        name: string;
        health: number;
        salary: number;
        respect: number;
        skillLevel: number;
        inventory: Inventory;
    }

    interface GameEvent {
        id: string;
        name: string;
        description: string;
        chance: number;
        effect: (state: GameState) => GameState;
    }

    interface GameState {
        currentLocation: string;
        currentDay: number;
        maxDays: number;
    }

    interface GameActions {
        buyDrug: (drugId: string, amount: number) => GameState;
        sellDrug: (drugId: string, amount: number) => GameState;
        travel: (locationId: string) => GameState;
        nextDay: () => GameState;
        newGame: (config?: Partial<GameConfig>) => GameState;
    }

}

export = DrugWars;