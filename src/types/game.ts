export interface Card {
  name: string;
  id: number;
  iconUrls: {
    medium: string;
  };
}

export interface Player {
  id: number;
  role: "NOT_IMPOSTOR" | "IMPOSTOR";
  hasSeenRole: boolean;
}