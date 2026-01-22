export interface Card {
  name: string;
  id: number;
  iconUrls: {
    medium: string;
  };
}

export type GameMode = 'CLASSIC' | 'DOUBLE_TROUBLE';

export interface Player {
  id: number;
  role: "NOT_IMPOSTOR" | "IMPOSTOR";
  hasSeenRole: boolean;
  assignedCard?: Card; // Carta específica do jogador (para modos com múltiplas cartas)
}

export interface GameSession {
  secretCard?: Card; // Carta principal (opcional, pois pode haver múltiplas)
  players: Player[];
  mode: GameMode;
}
