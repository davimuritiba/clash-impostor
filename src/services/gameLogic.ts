import { Card, Player, GameMode, GameSession } from '../types/game'

/**
 * Seleciona uma carta aleatória diferente da carta fornecida
 */
const selectDifferentCard = (allCards: Card[], excludeCard: Card): Card => {
  const availableCards = allCards.filter(card => card.id !== excludeCard.id);
  const randomIndex = Math.floor(Math.random() * availableCards.length);
  return availableCards[randomIndex];
};

/**
 * Embaralha um array usando Fisher-Yates Shuffle
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Configura o jogo baseado no modo selecionado
 */
export const setupGame = (
  allCards: Card[],
  totalPlayers: number,
  totalImpostors: number,
  gameMode: GameMode = "CLASSIC"
): GameSession => {
  // 1. Seleciona a carta secreta principal
  const randomIndex = Math.floor(Math.random() * allCards.length);
  const selectedCard = allCards[randomIndex];

  // 2. Para o modo Espião, seleciona uma carta diferente para o impostor
  let impostorCard: Card | undefined;
  if (gameMode === "SPY") {
    impostorCard = selectDifferentCard(allCards, selectedCard);
  }

  // 3. Criar array de papéis
  const roles: ("NOT_IMPOSTOR" | "IMPOSTOR")[] = [];
  for (let i = 0; i < totalImpostors; i++) roles.push('IMPOSTOR');
  for (let i = 0; i < (totalPlayers - totalImpostors); i++) roles.push('NOT_IMPOSTOR');

  // 4. Embaralhar papéis
  const shuffledRoles = shuffleArray(roles);

  // 5. Mapear para estrutura de jogadores com cartas atribuídas
  const players: Player[] = shuffledRoles.map((role, index) => {
    const player: Player = {
      id: index + 1,
      role,
      hasSeenRole: false,
    };

    // No modo Espião, atribuímos a carta específica para cada jogador
    if (gameMode === "SPY") {
      player.assignedCard = role === "IMPOSTOR" ? impostorCard : selectedCard;
    } else {
      // No modo Clássico, apenas não-impostores têm carta atribuída
      if (role === "NOT_IMPOSTOR") {
        player.assignedCard = selectedCard;
      }
    }

    return player;
  });

  return {
    secretCard: selectedCard,
    players,
    gameMode,
    impostorCard,
  };
};
