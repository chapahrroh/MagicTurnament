import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/playerContext";

interface Tournament {
  id: number;
  name: string;
  type: string;
  status: boolean;
  creationDate: string;
}

interface Match {
  id: number;
  tournament_id: number;
  player1_id: number;
  player2_id: number;
  win: number | null;
  status: boolean;
  draw: boolean;
  phase: number;
  player1_name?: string;
  player2_name?: string;
}

interface Player {
  id: number;
  name: string;
  creationDate: string;
  personalScore: number;
  tournament: Tournament[];
  matches?: Match[];
}

interface Deck {
  id: number;
  deckName: string;
  format: string;
  deckDescription: string;
  creationDate: string;
  deckList: string;
  player_id: number; // Added player_id property
}

interface CardDetails {
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

interface DeckViewModalProps {
  show: boolean;
  onHide: () => void;
  deck: Deck | null;
}

function DeckViewModal({ show, onHide, deck }: DeckViewModalProps) {
  const [cardDetails, setCardDetails] = useState<Map<string, CardDetails>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<{
    image: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!deck?.deckList) return;

      setIsLoading(true);
      try {
        const cardIds = deck.deckList.split("\n").map((line) => {
          const [quantity, id] = line.trim().split(" ");
          return { quantity: parseInt(quantity), id };
        });

        const uniqueCardIds = Array.from(
          new Set(cardIds.map((card) => card.id))
        );
        const details = new Map<string, CardDetails>();

        for (let i = 0; i < uniqueCardIds.length; i += 75) {
          const batch = uniqueCardIds.slice(i, i + 75);
          const response = await axios.post(
            "https://api.scryfall.com/cards/collection",
            {
              identifiers: batch.map((id) => ({ id })),
            }
          );
          response.data.data.forEach((card: CardDetails) => {
            details.set(card.id, card);
          });
        }
        setCardDetails(details);
      } catch (error) {
        console.error("Error fetching card details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (show && deck) {
      fetchCardDetails();
    }
  }, [show, deck]);

  const handleMouseMove = (e: React.MouseEvent, imageUrl: string) => {
    const x = e.clientX;
    const y = e.clientY;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const imageWidth = 330;
    const imageHeight = 460;

    let posX = x + 20;
    let posY = y + 20;

    if (posX + imageWidth > windowWidth) {
      posX = x - imageWidth - 20;
    }
    if (posY + imageHeight > windowHeight) {
      posY = y - imageHeight - 20;
    }

    setHoveredCard({ image: imageUrl, x: posX, y: posY });
  };

  if (!deck) return null;

  const cardList = deck.deckList
    .split("\n")
    .map((line) => {
      const [quantity, id] = line.trim().split(" ");
      return { quantity: parseInt(quantity), id };
    })
    .filter((card) => card.id);

  const getCardTypeIcon = (type_line: string) => {
    if (type_line.includes("Creature")) return "ms ms-creature";
    if (type_line.includes("Instant")) return "ms ms-instant";
    if (type_line.includes("Sorcery")) return "ms ms-sorcery";
    if (type_line.includes("Enchantment")) return "ms ms-enchantment";
    if (type_line.includes("Artifact")) return "ms ms-artifact";
    if (type_line.includes("Land")) return "ms ms-land";
    if (type_line.includes("Planeswalker")) return "ms ms-planeswalker";
    return "ms ms-ability";
  };

  return (
    <>
      <div className={`modal ${show ? "show d-block" : ""}`} tabIndex={-1}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">
                <i className="ms ms-deck ms-1x ms-cost ms-shadow me-2"></i>
                {deck.deckName}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr>
                        <th>Cantidad</th>
                        <th>Carta</th>
                        <th>Coste</th>
                        <th>Tipo</th>
                        <th>Rareza</th>
                        <th>Set</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cardList.map(({ quantity, id }) => {
                        const details = cardDetails.get(id);
                        if (!details) return null;
                        const imageUrl =
                          details.image_uris?.normal ||
                          details.card_faces?.[0].image_uris.normal;

                        return (
                          <tr key={id} className="align-middle">
                            <td>{quantity}x</td>
                            <td>
                              <div
                                className="d-flex align-items-center gap-2 card-name-hover"
                                onMouseMove={(e) =>
                                  handleMouseMove(e, imageUrl || "")
                                }
                                onMouseLeave={() => setHoveredCard(null)}
                              >
                                <img
                                  src={
                                    details.image_uris?.small ||
                                    details.card_faces?.[0].image_uris.small
                                  }
                                  alt={details.name}
                                  style={{ width: "30px", height: "auto" }}
                                  className="rounded"
                                />
                                {details.name}
                              </div>
                            </td>
                            <td>
                              {(
                                details.mana_cost ||
                                details.card_faces?.[0].mana_cost ||
                                ""
                              )
                                .match(/\{(.+?)\}/g)
                                ?.map((symbol, index) => (
                                  <i
                                    key={index}
                                    className={`ms ms-${symbol
                                      .replace(/[{}]/g, "")
                                      .toLowerCase()} ms-cost ms-shadow`}
                                  ></i>
                                ))}
                            </td>
                            <td>
                              <i
                                className={`${getCardTypeIcon(
                                  details.type_line
                                )} ms-1x ms-cost ms-shadow me-2`}
                              ></i>
                              {details.type_line}
                            </td>
                            <td>
                              <i
                                className={`ms ms-${details.rarity.toLowerCase()} ms-1x ms-cost ms-shadow me-2`}
                              ></i>
                              {details.rarity}
                            </td>
                            <td>{details.set_name}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {hoveredCard && (
        <img
          src={hoveredCard.image}
          alt="Card preview"
          className="card-hover-preview"
          style={{
            position: "fixed",
            left: hoveredCard.x,
            top: hoveredCard.y,
            maxHeight: "460px",
            opacity: 1,
          }}
        />
      )}
    </>
  );
}

function PlayerDetailPage() {
  const { isAuthenticated, user } = useAuth();
  const { id } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [deckPreviews, setDeckPreviews] = useState<Map<number, string>>(
    new Map()
  );

  const calculateStats = (matches: Match[] = []) => {
    const total = matches.length;
    const wins = matches.filter((m) => m.win === player?.id).length;
    const losses = matches.filter(
      (m) => m.status && m.win !== player?.id && !m.draw
    ).length;
    const draws = matches.filter((m) => m.draw).length;
    const pending = matches.filter((m) => !m.status).length;
    const winRate =
      total > 0 ? ((wins / (total - pending)) * 100).toFixed(1) : "0";

    return { total, wins, losses, draws, pending, winRate };
  };

  const fetchDeckArt = async (deck: Deck) => {
    try {
      const cardId = deck.deckList.split("\n")[0].split(" ")[1]; // Get first card ID
      const response = await axios.get(
        `https://api.scryfall.com/cards/${cardId}`
      );
      const artUrl =
        response.data.image_uris?.art_crop ||
        response.data.card_faces?.[0].image_uris.art_crop;

      setDeckPreviews((prev) => new Map(prev).set(deck.id, artUrl));
    } catch (error) {
      console.error("Error fetching deck art:", error);
    }
  };

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setIsLoading(true);
        const [playerResponse, matchesResponse, decksResponse] =
          await Promise.all([
            axios.get(`http://192.168.56.101:8000/player/${id}`),
            axios.get(`http://192.168.56.101:8000/player/${id}/matches`),
            axios.get(`http://192.168.56.101:8000/decks`), // We'll filter by player_id on frontend
          ]);

        const playerDecks = decksResponse.data.filter(
          (deck: Deck) => deck.player_id === parseInt(id!)
        );
        setDecks(playerDecks);
        playerDecks.forEach((deck: Deck) => fetchDeckArt(deck));

        // Fetch player names for each match
        const matchesWithNames = await Promise.all(
          matchesResponse.data.map(async (match: Match) => {
            const opponentId =
              match.player1_id === parseInt(id!)
                ? match.player2_id
                : match.player1_id;
            const opponentResponse = await axios.get(
              `http://192.168.56.101:8000/player/${opponentId}`
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

        setPlayer({
          ...playerResponse.data,
          matches: matchesWithNames,
        });
      } catch (error) {
        setError("Error al cargar los datos del jugador");
        console.error("Error fetching player data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || "Jugador no encontrado"}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Hero Section - New */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <h1 className="display-5 mb-3">
            <i className="ms ms-planeswalker ms-2x ms-cost ms-shadow me-3"></i>
            {player.name}
          </h1>
          <p className="lead text-muted">
            Jugador desde {new Date(player.creationDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Stats Cards - Updated with MTG colors */}
        <div className="col-md-3">
          <div className="card bg-primary bg-gradient text-white h-100">
            <div className="card-body text-center">
              <i className="ms ms-w ms-3x ms-cost mb-3"></i>
              <h3 className="h2 mb-0">
                {calculateStats(player.matches).total}
              </h3>
              <p className="mb-0">Partidas Totales</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success bg-gradient text-white h-100">
            <div className="card-body text-center">
              <i className="ms ms-g ms-3x ms-cost mb-3"></i>
              <h3 className="h2 mb-0">{calculateStats(player.matches).wins}</h3>
              <p className="mb-0">Victorias</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger bg-gradient text-white h-100">
            <div className="card-body text-center">
              <i className="ms ms-r ms-3x ms-cost mb-3"></i>
              <h3 className="h2 mb-0">
                {calculateStats(player.matches).losses}
              </h3>
              <p className="mb-0">Derrotas</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info bg-gradient text-white h-100">
            <div className="card-body text-center">
              <i className="ms ms-u ms-3x ms-cost mb-3"></i>
              <h3 className="h2 mb-0">{player.personalScore}</h3>
              <p className="mb-0">Puntos Totales</p>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="col-md-6">
          {/* Matches Section - Updated */}
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-dark text-white">
              <h3 className="card-title h5 mb-0">
                <i className="ms ms-dagger ms-1x ms-cost ms-shadow me-2"></i>
                Historial de Partidas
              </h3>
            </div>
            <div className="card-body">
              {player.matches?.length ? (
                <div className="list-group">
                  {player.matches.map((match) => (
                    <div key={match.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h4 className="h6 mb-1">
                            vs{" "}
                            {match.player1_id === player.id
                              ? match.player2_name
                              : match.player1_name}
                          </h4>
                          <small className="text-muted">
                            <i className="bi bi-diagram-3 me-1"></i>
                            Fase {match.phase}
                          </small>
                        </div>
                        <div>
                          <span
                            className={`badge ${
                              match.draw
                                ? "bg-warning"
                                : match.win === player.id
                                ? "bg-success"
                                : match.status
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                          >
                            {match.draw
                              ? "Empate"
                              : match.win === player.id
                              ? "Victoria"
                              : match.status
                              ? "Derrota"
                              : "Pendiente"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  El jugador aún no ha jugado ninguna partida
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {/* Decks Section - Updated */}
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-dark text-white">
              <h3 className="card-title h5 mb-0 d-flex justify-content-between align-items-center">
                <span>
                  <i className="ms ms-deck ms-1x ms-cost ms-shadow me-2"></i>
                  Mazos del Jugador
                </span>
                {isAuthenticated && user?.id === parseInt(id!) && (
                  <Link to="/deck/new" className="btn btn-sm btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>
                    Nuevo Mazo
                  </Link>
                )}
              </h3>
            </div>
            <div className="card-body">
              {decks.length > 0 ? (
                <div className="row row-cols-1 row-cols-md-2 g-4">
                  {decks.map((deck) => (
                    <div key={deck.id} className="col">
                      <div className="card h-100 border-0 shadow-sm">
                        {deckPreviews.get(deck.id) && (
                          <div
                            className="card-img-top"
                            style={{
                              height: "100px",
                              backgroundImage: `url(${deckPreviews.get(
                                deck.id
                              )})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderBottom: "1px solid rgba(0,0,0,0.125)",
                            }}
                          />
                        )}
                        <div className="card-body">
                          <h5 className="card-title d-flex justify-content-between align-items-center">
                            {deck.deckName}
                            <span className="badge bg-secondary">
                              {deck.format}
                            </span>
                          </h5>
                          <p className="card-text small text-muted">
                            {deck.deckDescription}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <i className="bi bi-calendar3 me-1"></i>
                              {new Date(deck.creationDate).toLocaleDateString()}
                            </small>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setSelectedDeck(deck)}
                              >
                                <i className="ms ms-ability-adventure ms-1x ms-cost ms-shadow me-2"></i>
                                Ver Mazo
                              </button>
                              {isAuthenticated &&
                                user?.id === parseInt(id!) && (
                                  <Link
                                    to={`/deck/edit/${deck.id}`}
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={(e) => {
                                      if (!deck.id) {
                                        e.preventDefault();
                                        console.error("No deck ID available");
                                      }
                                      console.log(
                                        "Navigating to edit deck:",
                                        deck.id
                                      );
                                    }}
                                  >
                                    <i className="ms ms-counter ms-1x ms-cost ms-shadow me-2"></i>
                                    Editar
                                  </Link>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  El jugador aún no tiene mazos registrados
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tournament History - Full Width */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white">
              <h3 className="card-title h5 mb-0">
                <i className="ms ms-dci ms-1x ms-cost ms-shadow me-2"></i>
                Historial de Torneos
              </h3>
            </div>
            <div className="card-body">
              {player.tournament?.length ? (
                <div className="list-group">
                  {player.tournament.map((t) => (
                    <div
                      key={t.id}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h4 className="h6 mb-1">{t.name}</h4>
                          <small className="text-muted">
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(t.creationDate).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-secondary">
                            <i className="bi bi-diagram-3 me-1"></i>
                            {t.type}
                          </span>
                          <span
                            className={`badge bg-${
                              t.status ? "danger" : "success"
                            }`}
                          >
                            {t.status ? "Finalizado" : "En curso"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  El jugador aún no ha participado en ningún torneo
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <DeckViewModal
        show={selectedDeck !== null}
        onHide={() => setSelectedDeck(null)}
        deck={selectedDeck}
      />
    </div>
  );
}

export default PlayerDetailPage;
