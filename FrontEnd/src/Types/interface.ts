export interface CardData {
  id: string;
  name: string;
  set: string;
  collector_number: string;
  image_uris?: {
    normal?: string;
    small?: string;
    art_crop?: string;
  };
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

export interface Player {
  id: number;
  name: string;
  personalScore: number;
  creationDate: string;
  matches?: Match[];
  tournament: Tournament[];
}

export interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  status: boolean;
  draw: boolean;
  win: number | null;
  phase: number;
  player1_name?: string;
  player2_name?: string;
  tournament_id: number;
}

export interface TournamentScore {
  id: number;
  tournament_id: number;
  player_id: number;
  score: number;
}

export interface Tournament {
  id: number;
  name: string;
  date: string;
  type: string;
  creationDate: string;
  status: boolean;
  players?: Player[];
  matches?: Match[];
  scores?: TournamentScore[];
  currentPhase?: number;
  final_standings?: Array<{
    position: number;
    player_id: number;
    player_name: string;
    final_score: number;
  }>;
}

export interface GroupedMatches {
  [phase: number]: Match[];
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Deck {
  id: number;
  deckName: string;
  format: string;
  deckDescription: string;
  creationDate: string;
  deckList: string;
  player_id: number;
}

export interface CardDetails {
  id: string;
  name: string;
  mana_cost?: string;
  type_line: string;
  rarity: string;
  set_name: string;
  image_uris?: {
    small: string;
    normal: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost: string;
    image_uris: {
      small: string;
      normal: string;
    };
  }>;
}

export interface DeckViewModalProps {
  show: boolean;
  onHide: () => void;
  deck: Deck | null;
}

export interface ScryfallCard {
  id: string;
  name: string;
  image_uris?: {
    small: string;
    normal: string;
    art_crop: string;
  };
  card_faces?: Array<{
    name: string;
    image_uris: {
      small: string;
      normal: string;
      art_crop: string;
    };
  }>;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
}

export interface DeckCard {
  id: string;
  name: string;
  quantity: number;
  image: string;
}

export interface CardEntry {
  quantity: number;
  id: string;
}

export interface DeckFormData {
  deckName: string;
  format: string;
  deckDescription: string;
}

export interface SetMatchWinCardProps {
  matchId: number;
  player1Name: string;
  player2Name: string;
  player1Id: number;
  player2Id: number | null;
  onSuccess: (matchId: number) => void;
}
