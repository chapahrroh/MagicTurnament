type Tournament = {
  id: number;
  name: string;
  type: string;
  status: boolean;
  creationDate: string;
};

type Scores = {
  tournament_id: number;
  player_id: number;
  id: number;
  score: number;
};

type Matches = {
  tournament_id: number;
  player1_id: number;
  player2_id: number;
  win: number | null;
  draw: boolean;
  id: number;
  status: boolean;
  phase: number;
};

type Player = {
  id: number;
  name: string;
  creationDate: string;
  personalScore: number;
};

type PlayerCardProps = {
  id: string;
  name: string;
  creationDate: string;
  personalScore: number;
  tournament?: Tournament[];
};

type TournamentCardProps = {
  id: number;
  name: string;
  type: string;
  creationDate: string;
  Players: Player[];
  Status: boolean;
  scores: Scores[];
  matches: Matches[];
  onSuccess: () => void;
};

export type { Tournament, PlayerCardProps };
