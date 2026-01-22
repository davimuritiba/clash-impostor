export interface Card {
  name: string;
  id: number;
  iconUrls: {
    medium: string;
  };
  isCustom?: boolean; // Indica se é uma carta personalizada
  customImageUrl?: string; // URL de imagem personalizada (opcional)
}

// Verifica se uma carta tem imagem personalizada (URL válida)
export const hasCustomImage = (card: Card): boolean => {
  return !!(card.customImageUrl && card.customImageUrl.startsWith('http'));
};

// Tipo para origem das cartas
export type CardSource = "CLASH" | "CUSTOM" | "BOTH";

export interface CardSourceInfo {
  id: CardSource;
  name: string;
  description: string;
  icon: string;
}

export const CARD_SOURCES: CardSourceInfo[] = [
  {
    id: "CLASH",
    name: "Clash Royale",
    description: "Usar apenas cartas do Clash Royale",
    icon: "⚔️",
  },
  {
    id: "CUSTOM",
    name: "Personalizadas",
    description: "Usar apenas suas cartas personalizadas",
    icon: "✨",
  },
  {
    id: "BOTH",
    name: "Todas",
    description: "Misturar cartas do Clash com personalizadas",
    icon: "🎲",
  },
];

// Chave do localStorage para cartas personalizadas
export const CUSTOM_CARDS_STORAGE_KEY = "clash-impostor-custom-cards";

// Modos de jogo disponíveis
export type GameMode = "CLASSIC" | "SPY";

export interface GameModeInfo {
  id: GameMode;
  name: string;
  description: string;
  icon: string;
}

// Informações sobre cada modo de jogo
export const GAME_MODES: GameModeInfo[] = [
  {
    id: "CLASSIC",
    name: "Clássico",
    description: "O impostor não vê nenhuma carta e precisa blefar",
    icon: "🎭",
  },
  {
    id: "SPY",
    name: "Espião",
    description: "O impostor vê uma carta diferente e não sabe que é impostor!",
    icon: "🕵️",
  },
];

export interface Player {
  id: number;
  role: "NOT_IMPOSTOR" | "IMPOSTOR";
  hasSeenRole: boolean;
  // Carta que o jogador vê (no modo Espião, o impostor vê uma carta diferente)
  assignedCard?: Card;
}

export interface GameSession {
  secretCard: Card;
  players: Player[];
  gameMode: GameMode;
  // Carta falsa mostrada ao impostor no modo Espião
  impostorCard?: Card;
}