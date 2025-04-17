export type SaveVariables = {
    game: {
        elapsedDays: number;
        creationDate: string;
        lastPlayedDate: string;
        seed: number;
        organisationName: string;
        playtime: number;
    },
    player: {
        rank: number;
        tier: number;
        xp: number;
        totalXp: number;
        onlineBalance: number;
        netWorth: number;
        lifetimeEarnings: number;
    },
}
