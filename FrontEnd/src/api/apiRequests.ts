import axios from "axios";
import {
  RegisterData,
  Tournament,
  Deck,
  Match,
  CardData as CardDetails,
} from "../Types/Types";
import { Player } from "../Types/Types";

interface FetchTournamentReturn {
  tournament: Tournament[] | null;
  error: string | null;
}

interface TournamentActionResponse {
  success: boolean;
  error: string | null;
}
interface RegisterPlayerResponse {
  success: boolean;
  error: string | null;
}
interface FetchPlayerResponse {
  Players: Player[] | null;
  error: string | null;
}
interface fetchDeckArtResponse {
  artUrl: string | null;
  error: string | null;
}
interface FetchPlayerDataResponse {
  Player: Player | null;
  matches: Match[] | null;
  decks: Deck[] | null;
  error: string | null;
}

interface FetchCardDetailRespose {
  cardDetails: Map<string, CardDetails>;
  error: string | null;
}

// API base URL
const API_BASE_URL = "http://192.168.56.101:8000";
const API_TOURNAMENTS_URL = `${API_BASE_URL}/tournament`;
const API_PLAYER_URL = `${API_BASE_URL}/player`;
const API_DECK_URL = `${API_BASE_URL}/decks`;
const API_BASE_SCRAYFALL_URL = `https://api.scryfall.com`;
const API_BASE_SCRAYFALL_CARD_URL = `${API_BASE_SCRAYFALL_URL}/cards`;
const API_BASE_SCRAYFALL_CARD_COLLECTION_URL = `${API_BASE_SCRAYFALL_URL}/cards/collection`;

// tournaments methods section
export const fetchTournaments = async (): Promise<FetchTournamentReturn> => {
  try {
    const response = await axios.get<Tournament[]>(`${API_TOURNAMENTS_URL}`);
    return {
      tournament: response.data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return {
      tournament: null,
      error: "Error al cargar los torneos",
    };
  }
};

export const fetchTournamentById = async (
  id: string
): Promise<FetchTournamentReturn> => {
  try {
    const response = await axios.get(`${API_TOURNAMENTS_URL}/${id}`);
    return {
      tournament: response.data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching tournament:", error);
  }
  return {
    tournament: null,
    error: "Error al cargar el torneo",
  };
};

export const nextTournamentPhase = async (
  id: string
): Promise<TournamentActionResponse> => {
  try {
    await axios.post(`${API_TOURNAMENTS_URL}/${id}/next-phase`);
    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Error advancing to next phase:", error);
    return {
      success: false,
      error: "Error al avanzar a la siguiente fase",
    };
  }
};

export const finishTournament = async (
  id: string
): Promise<TournamentActionResponse> => {
  try {
    await axios.post(`${API_TOURNAMENTS_URL}/${id}/finish`);
    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.error("Error finishing tournament:", error);
    return {
      success: false,
      error:
        error.response?.status === 400
          ? error.response.data.detail
          : "Error al finalizar el torneo",
    };
  }
};

// players methods section
export const registerPlayer = async (
  formData: RegisterData
): Promise<RegisterPlayerResponse> => {
  try {
    const response = await axios.post<RegisterPlayerResponse>(API_PLAYER_URL, {
      methosd: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }),
    });
    return response.data;
  } catch (error) {
    console.error("Error registering player:", error);
    return {
      success: false,
      error: "Error al registrar el jugador",
    };
  }
};

export const fetchPlayers = async (): Promise<FetchPlayerResponse> => {
  try {
    const response = await axios.get<Player[]>(`${API_PLAYER_URL}`);
    return {
      Players: response.data,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching players:", error);
    return {
      Players: null,
      error: "Error al cargar los jugadores. Por favor, intente de nuevo.",
    };
  }
};

export const fetchPlayerData = async (
  id: string
): Promise<FetchPlayerDataResponse> => {
  try {
    const [playerResponse, matchesResponse, decksResponse] = await Promise.all([
      axios.get(`${API_PLAYER_URL}/${id}`),
      axios.get(`${API_PLAYER_URL}/${id}/matches`),
      axios.get(`${API_DECK_URL}`),
    ]);
    if (playerResponse) {
      const playerDecks = decksResponse.data.filter(
        (deck: Deck) => deck.player_id === parseInt(id!)
      );

      // Fetch player names for each match
      const matchesWithNames = await Promise.all(
        matchesResponse.data.map(async (match: Match) => {
          const opponentId =
            match.player1_id === parseInt(id!)
              ? match.player2_id
              : match.player1_id;
          const opponentResponse = await axios.get(
            `${API_PLAYER_URL}/${opponentId}`
          );
          return {
            ...match,
            player1_name:
              match.player1_id === parseInt(id!)
                ? playerResponse.data.name
                : opponentResponse.data.name,
            player2_name:
              match.player1_id === parseInt(id!)
                ? opponentResponse.data.name
                : playerResponse.data.name,
          };
        })
      );

      return {
        Player: playerResponse.data,
        matches: matchesWithNames,
        decks: playerDecks,
        error: null,
      };
    } else {
      return {
        Player: null,
        matches: [],
        decks: [],
        error: "Player not found",
      };
    }
  } catch (error) {
    return {
      Player: null,
      matches: [],
      decks: [],
      error: "Player not found",
    };
  }
};

// deck methods section

export const fetchDeckArt = async (
  deck: Deck
): Promise<fetchDeckArtResponse> => {
  try {
    const cardId = deck.deckList.split("\n")[0].split(" ")[1]; // Get first card ID
    const response = await axios.get(
      `${API_BASE_SCRAYFALL_CARD_URL}/${cardId}`
    );
    const artUrl =
      response.data.image_uris?.art_crop ||
      response.data.card_faces?.[0].image_uris.art_crop;
    return {
      artUrl: artUrl,
      error: null,
    };
  } catch (error) {
    return {
      artUrl: null,
      error: "Error al cargar la imagen de la carta",
    };
    console.error("Error fetching deck art:", error);
  }
};

export const fetchCardDetails = async (
  deck: Deck
): Promise<FetchCardDetailRespose> => {
  try {
    const cardIds = deck.deckList.split("\n").map((line) => {
      const [quantity, id] = line.trim().split(" ");
      return { quantity: parseInt(quantity), id };
    });

    const uniqueCardIds = Array.from(new Set(cardIds.map((card) => card.id)));
    const details = new Map<string, CardDetails>();

    for (let i = 0; i < uniqueCardIds.length; i += 75) {
      const batch = uniqueCardIds.slice(i, i + 75);
      const response = await axios.post(
        `${API_BASE_SCRAYFALL_CARD_COLLECTION_URL}`,
        {
          identifiers: batch.map((id) => ({ id })),
        }
      );
      response.data.data.forEach((card: CardDetails) => {
        details.set(card.id, card);
      });
    }
    return {
      cardDetails: details,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching card details:", error);
    return {
      cardDetails: new Map<string, CardDetails>(),
      error: "Error fetching card details. Please try again.",
    };
  }
};
