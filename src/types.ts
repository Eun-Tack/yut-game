// Game types
export type YutResult = '빽도' | '도' | '개' | '걸' | '윷' | '모';

export interface Player {
  id: string;
  name: string;
  selected: boolean;
}

export interface Connection {
  from: string;
  to: string;
  result: YutResult | null;
}

export type ScreenType = 'main' | 'input' | 'game' | 'result';

export interface GameState {
  screen: ScreenType;
  players: Player[];
  connections: Connection[];
  currentPlayer: string | null;
  startPlayer: string | null;
}
