export interface CardData {
  id: string;
  name: string;
  set: string;
  mana_cost?: string;
  type_line: string;
  rarity: string;
  set_name: string;
  collector_number: string;
  image_uris?: {
    normal?: string;
    small?: string;
    manacost?: string;

    art_crop?: string;
  };
  card_faces?: Array<{
    image_uris: {
      normal: string;
      small: string;
      art_crop: string;
    };
  }>;
}

export interface Player {
  id: number;
  name: string;
  dci?: string;
  personalScore: number;
  creationDate: string;
  matches?: Match[];
  tournament: Tournament[];
}

export interface Match {
  id: number;
  tournament_id: number;
  player1_id: number;
  player2_id: number;
  player1_name?: string;
  player2_name?: string;
  status: boolean;
  draw: boolean;
  phase: number;
  win: number | null;
}

export interface Tournament {
  id: number;
  name: string;
  date: string;
  type: string;
  creationDate: string;
  status: boolean;
  players: Player[];
  matches: Match[];
  scores: TournamentScore[];
  currentPhase?: number;
  final_standings?: Array<{
    position: number;
    player_id: number;
    player_name: string;
    final_score: number;
  }>;
}

export interface Deck {
  id: number;
  deckName: string;
  deckDescription: string;
  format: string;
  creationDate: string;
  cards: string[];
  player_id: number;
  deckList: string; // Added this field
}

export interface Score {
  id: number;
  tournamentId: number;
  playerId: number;
  points: number;
  position?: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  message?: string;
  error?: string;
}

export interface FetchTournamentReturn {
  tournament: Tournament[] | null;
  error: string | null;
}

export interface FetchPlayerResponse {
  Players: Player[] | null;
  error: string | null;
}

export interface TournamentResponse extends ApiResponse<Tournament[]> {
  tournaments: Tournament[];
}

export interface PlayerResponse extends ApiResponse<Player[]> {
  players: Player[];
}

export interface TournamentScore {
  id: number;
  tournament_id: number;
  player_id: number;
  score: number;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface GroupedMatches {
  [phase: number]: Match[];
}
