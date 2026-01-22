export interface Card {
  name: string;
  id: number;
  iconUrls: {
    medium: string;
  };
}

export type Role = "NOT_IMPOSTOR" | "IMPOSTOR";

export interface Player {
  id: number;
  role: Role;
  hasSeenRole: boolean;
}

export type GameMode = "CLASSIC" | "RELAMPAGO";

export interface GameConfigBase {
  playersCount: number;
  impostorsCount: number;
}

export interface ClassicConfig extends GameConfigBase {
  mode: "CLASSIC";
}

export interface RelampagoConfig extends GameConfigBase {
  mode: "RELAMPAGO";
  /** Tempo (segundos) que cada jogador vê sua info antes de avançar automaticamente */
  revealSeconds: number;
  /** Duração (segundos) da rodada na fase PLAYING */
  roundSeconds: number;
}

export type GameConfig = ClassicConfig | RelampagoConfig;

export interface GameSession {
  mode: GameMode;
  config: GameConfig;
  secretCard: Card;
  players: Player[];
}