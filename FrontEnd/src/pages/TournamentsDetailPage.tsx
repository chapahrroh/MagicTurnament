import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

import DeletCard from "../components/DeletCard";
import AddPlayerTournament from "../components/AddPlayerTournament";
import GenerateMatchButon from "../components/GenerateMatchButon";

interface Player {
  id: number;
  name: string;
  personalScore: number;
}

interface Match {
  id: number;
  player1_id: number;
  player2_id: number;
  status: boolean;
  draw: boolean;
  win: number | null;
  phase: number; // Added phase property
}

interface TournamentScore {
  player_id: number;
  score: number;
}

interface Tournament {
  id: number;
  name: string;
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

interface GroupedMatches {
  [phase: number]: Match[];
}

function TournamentsDetailPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentPhaseCompleted, setIsCurrentPhaseCompleted] = useState(false);

  // Extract values from tournament for easier access
  const Status = tournament?.status || false;
  const type = tournament?.type || "";

  // Move matchesByPhase useMemo before useEffect hooks
  const matchesByPhase = useMemo(() => {
    if (!tournament) return {};

    return tournament.matches.reduce((acc: GroupedMatches, match) => {
      const phase = match.phase || 1;
      if (!acc[phase]) {
        acc[phase] = [];
      }
      acc[phase].push(match);
      return acc;
    }, {});
  }, [tournament]);

  const fetchTournament = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_SERVER}/tournament/${id}`
      );
      // Remove the [0] since we're getting a single object
      setTournament(response.data);
    } catch (error) {
      setError("Error al cargar el torneo");
      console.error("Error fetching tournament:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournament();
  }, [id]);

  useEffect(() => {
    if (tournament) {
      const currentPhaseMatches = tournament.matches.filter(
        (match) => match.phase === tournament.currentPhase
      );
      setIsCurrentPhaseCompleted(
        currentPhaseMatches.every((match) => match.status === true)
      );
    }
  }, [tournament]);

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error || "Torneo no encontrado"}
        </div>
      </div>
    );
  }

  const getPlayerName = (playerId: number) => {
    const player = tournament.players.find((p) => p.id === playerId);
    return player?.name || "Jugador desconocido";
  };

  const handleNextPhase = async () => {
    try {
      await axios.post(
        `{import.meta.env.VITE_BACKEND_SERVER}/tournament/${id}/next-phase`
      );

      await fetchTournament();
    } catch (error) {
      console.error("Error advancing to next phase:", error);
      setError("Error al avanzar a la siguiente fase");
    }
  };

  const handleFinishTournament = async () => {
    try {
      await axios.post(`{import.meta.env.VITE_BACKEND_SERVER}/tournament/${id}/finish`);
      await fetchTournament();
    } catch (error: any) {
      console.error("Error finishing tournament:", error);
      // Show error message to user if the tournament has unfinished matches
      if (error.response?.status === 400) {
        setError(error.response.data.detail);
      } else {
        setError("Error al finalizar el torneo");
      }
    }
  };

  return (
    <div className="container py-4">
      {/* Tournament Header */}
      <div className="card mb-4 shadow-sm">
        <div
          className={`card-header ${
            tournament.status ? "bg-danger" : "bg-success"
          } text-white`}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">
              <i className="bi bi-trophy me-2"></i>
              {tournament.name}
            </h1>
            <span className="badge bg-light text-dark">{tournament.type}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p className="mb-1">
                <i className="bi bi-calendar3 me-2"></i>
                Creado: {new Date(tournament.creationDate).toLocaleDateString()}
              </p>
              <p className="mb-1">
                <i className="bi bi-people me-2"></i>
                Jugadores: {tournament.players.length}
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <span
                className={`badge bg-${
                  tournament.status ? "danger" : "success"
                } p-2`}
              >
                <i
                  className={`bi bi-${
                    tournament.status ? "flag-fill" : "play-fill"
                  } me-2`}
                ></i>
                {tournament.status ? "Finalizado" : "En curso"}
              </span>
            </div>
          </div>
        </div>
      </div>
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      <div className="row">
        {/* Players Section */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h2 className="h5 mb-0">
                <i className="bi bi-people-fill me-2"></i>
                Jugadores
              </h2>
            </div>
            <div className="card-body">
              <div className="list-group">
                {tournament.players.map((player) => (
                  <Link
                    key={player.id}
                    to={`/player/${player.id}`}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    {player.name}
                    <span className="badge bg-primary rounded-pill">
                      {tournament.scores.find((s) => s.player_id === player.id)
                        ?.score || 0}{" "}
                      pts
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Matches Section */}
        <div className="col-md-8">
          <div className="card shadow-sm bg-dark">
            <div className="card-header bg-primary text-white border-bottom border-secondary">
              <h2 className="h5 mb-0">
                <i className="bi bi-controller me-2"></i>
                Partidas
              </h2>
            </div>
            <div className="card-body p-0">
              {tournament.matches.length > 0 ? (
                Object.entries(matchesByPhase)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([phase, matches], index) => (
                    <div
                      key={phase}
                      className={`p-3 ${
                        index % 2 === 0 ? "bg-dark" : "bg-dark bg-opacity-75"
                      }`}
                    >
                      <h3 className="h5 d-flex align-items-center mb-3">
                        <span className="badge bg-secondary me-2">
                          Fase {phase}
                        </span>
                        {Number(phase) === tournament.currentPhase && (
                          <span className="badge bg-warning ms-2">Actual</span>
                        )}
                      </h3>
                      <div className="list-group">
                        {matches.map((match: Match) => (
                          <Link
                            key={match.id}
                            to={`/match/${match.id}`}
                            className={`list-group-item list-group-item-action border-start border-4 bg-dark bg-opacity-50 text-white ${
                              match.status
                                ? match.draw
                                  ? "border-info"
                                  : "border-success"
                                : "border-warning"
                            }`}
                          >
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <div className="match-players">
                                  <span
                                    className={`${
                                      match.win === match.player1_id
                                        ? "text-success fw-bold"
                                        : "text-light"
                                    }`}
                                  >
                                    {getPlayerName(match.player1_id)}
                                  </span>
                                  <span className="text-secondary mx-2">
                                    vs
                                  </span>
                                  <span
                                    className={`${
                                      match.win === match.player2_id
                                        ? "text-success fw-bold"
                                        : "text-light"
                                    }`}
                                  >
                                    {getPlayerName(match.player2_id)}
                                  </span>
                                </div>
                              </div>
                              {match.status ? (
                                match.draw ? (
                                  <span className="badge bg-info">Empate</span>
                                ) : (
                                  <span className="badge bg-success">
                                    Ganador: {getPlayerName(match.win!)}
                                  </span>
                                )
                              ) : (
                                <span className="badge bg-warning text-dark">
                                  Pendiente
                                </span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="alert alert-info m-3 bg-dark text-info border-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No hay partidas programadas
                </div>
              )}
            </div>
          </div>

          {/* Final Standings Section */}
          {tournament.status && tournament.final_standings && (
            <div className="card shadow-sm mt-4">
              <div className="card-header bg-warning text-dark">
                <h2 className="h5 mb-0">
                  <i className="bi bi-trophy-fill me-2"></i>
                  Posiciones Finales
                </h2>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {tournament.final_standings.map((standing) => (
                    <div
                      key={standing.player_id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <span className="badge bg-secondary me-2">
                          #{standing.position}
                        </span>
                        {standing.player_name}
                      </div>
                      <span className="badge bg-primary">
                        {standing.final_score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Actions Section */}
          <div className="card shadow-sm mt-4">
            <div className="card-body">
              <div className="d-flex gap-2 justify-content-between">
                <AddPlayerTournament
                  status={Status}
                  onSuccess={fetchTournament}
                  tournament_id={id?.toString() || ""}
                  hasMatches={tournament.matches.length > 0} // Add this prop
                />
                <div className="d-flex gap-2">
                  {type === "elimination" && !Status && (
                    <button
                      className="btn btn-info text-white"
                      disabled={!isCurrentPhaseCompleted}
                      onClick={handleNextPhase}
                    >
                      <i className="bi bi-diagram-3 me-2"></i>
                      Siguiente Fase
                    </button>
                  )}
                  {!Status && ( // Only show if tournament is not finished
                    <>
                      <GenerateMatchButon
                        status={Status}
                        onSuccess={fetchTournament}
                        id={id?.toString() || ""}
                        hasMatches={tournament.matches.length > 0} // Add this prop
                      />
                      <button
                        className="btn btn-danger"
                        onClick={handleFinishTournament}
                      >
                        <i className="bi bi-flag-fill me-2"></i>
                        Finalizar Torneo
                      </button>
                    </>
                  )}
                  <DeletCard
                    id={id?.toString() || ""}
                    onSuccess={fetchTournament}
                    cardtype="tournament"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TournamentsDetailPage;
