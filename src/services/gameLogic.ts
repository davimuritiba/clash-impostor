import {Card, Player, GameMode, GameSession} from '../types/game'

export const setupGame = (
    allCards: Card[], 
    totalPlayers: number, 
    totalImpostors: number, 
    mode: GameMode = 'CLASSIC'
): GameSession => {
    const randomIndex = Math.floor(Math.random() * allCards.length)
    const card1 = allCards[randomIndex]

    const roles: ("NOT_IMPOSTOR" | "IMPOSTOR")[] =[]
    for (let i = 0; i < totalImpostors; i++) roles.push('IMPOSTOR');
    for (let i = 0; i < (totalPlayers - totalImpostors); i++) roles.push('NOT_IMPOSTOR');

    // Embaralhar papéis (Fisher-Yates Shuffle)
    for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    // Mapear para estrutura de jogadores
    const players: Player[] = roles.map((role, index) => ({
        id: index + 1,
        role,
        hasSeenRole: false,
    }));

    // Distribuir cartas baseado no modo
    if (mode === 'CLASSIC') {
        players.forEach(p => {
            if (p.role === 'NOT_IMPOSTOR') {
                p.assignedCard = card1;
            }
        });
    } else if (mode === 'DOUBLE_TROUBLE') {
        // Escolher segunda carta diferente
        let idx2 = Math.floor(Math.random() * allCards.length);
        while (allCards[idx2].id === card1.id) {
             idx2 = Math.floor(Math.random() * allCards.length);
        }
        const card2 = allCards[idx2];

        // Pegar jogadores não-impostores
        const civs = players.filter(p => p.role === 'NOT_IMPOSTOR');
        
        // Preparar pool de cartas (metade A, metade B)
        const cardsToDistribute: Card[] = [];
        const split = Math.ceil(civs.length / 2);
        
        for(let i=0; i<split; i++) cardsToDistribute.push(card1);
        for(let i=split; i<civs.length; i++) cardsToDistribute.push(card2);
        
        // Embaralhar distribuição
        for (let i = cardsToDistribute.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardsToDistribute[i], cardsToDistribute[j]] = [cardsToDistribute[j], cardsToDistribute[i]];
        }
        
        // Atribuir
        civs.forEach((civ, i) => {
            civ.assignedCard = cardsToDistribute[i];
        });
    }

    return {
        secretCard: card1, // Mantém compatibilidade ou como referência
        players,
        mode
    };
};
