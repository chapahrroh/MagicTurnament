import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { useAuth } from "../context/playerContext";
import { Player, Deck, Match } from "../Types/Types";
import { fetchDeckArt, fetchPlayerData } from "../api/apiRequests";

import DeckViewModal from "../components/DeckViewModal";

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

  const getDeckArt = async (deck: Deck) => {
    try {
      const { artUrl: deckArt, error: deckArtError } = await fetchDeckArt(deck);
      if (deckArt) {
        setDeckPreviews((prev) => new Map(prev).set(deck.id, deckArt));
      } else {
        console.error("Error fetching deck art:", deckArtError);
      }
    } catch (error) {
      console.error("Error setting deck previews:", error);
    }
  };
  const getPlayerData = async () => {
    setIsLoading(true);
    const {
      Player: fetchedPlayer,
      matches: fetchedMatches,
      decks: fetchedDecks,
      error: fetchError,
    } = await fetchPlayerData(id!);
    if (fetchedPlayer) {
      setPlayer({
        ...fetchedPlayer,
        matches: fetchedMatches || [],
      });

      setDecks(fetchedDecks || []);
      if (fetchedDecks) {
        fetchedDecks.forEach((deck) => {
          getDeckArt(deck);
        });
      }
      setError(null);
    } else {
      setPlayer(null);
      setDecks([]);
      setError(fetchError);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    getPlayerData();
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
