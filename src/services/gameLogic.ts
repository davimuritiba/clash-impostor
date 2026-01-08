import {Card, Player} from '../types/game'

export const setupGame= (allCards: Card[], totalPlayers: number, totalImpostors: number) =>{
    const randomIndex = Math.floor(Math.random() * allCards.length)
    const selectedCard = allCards[randomIndex]

    const roles: ("NOT_IMPOSTOR" | "IMPOSTOR")[] =[]
    for (let i = 0; i < totalImpostors; i++) roles.push('IMPOSTOR');
    for (let i = 0; i < (totalPlayers - totalImpostors); i++) roles.push('NOT_IMPOSTOR');

  // 3. Embaralhar papéis (Fisher-Yates Shuffle)
    for (let i = roles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [roles[i], roles[j]] = [roles[j], roles[i]];
    }

  // 4. Mapear para estrutura de jogadores
    const players: Player[] = roles.map((role, index) => ({
        id: index + 1,
        role,
        hasSeenRole: false,
    }));

  return {
    secretCard: selectedCard,
    players,
  };
};
