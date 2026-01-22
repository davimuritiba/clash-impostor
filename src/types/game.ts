export interface Card {
  name: string;
  id: number;
  iconUrls: {
    medium: string;
  };
}

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