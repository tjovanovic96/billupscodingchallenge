export interface Choice {
  id: number;
  name: string;
}

export type GameOutcome = 'Win' | 'Lose' | 'Tie';

export interface PlayResult {
  username: string;
  results: GameOutcome;
  player: number;
  computer: number;
}

export interface ScoreboardEntry {
  id: number;
  username: string;
  playerChoiceId: number;
  computerChoiceId: number;
  result: string;
  playedAtUtc: string;
}
