import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Matches, TournamentCardProps } from "../Types/Types";

function TournamentCard({
  id,
  name,
  type,
  creationDate,
  Players = [],
  Status,
  scores = [],
  matches = [],
}: TournamentCardProps) {
  // Helper to group matches by phase
  const getMatchesByPhase = useMemo(() => {
    const phases = matches.reduce((acc, match) => {
      const phase = match.phase || 1;
      if (!acc[phase]) acc[phase] = [];
      acc[phase].push(match);
      return acc;
    }, {} as Record<number, Matches[]>);

    return Object.entries(phases).sort(([a], [b]) => Number(a) - Number(b));
  }, [matches]);

  // Helper to get the current phase number
  const getCurrentPhase = useMemo(() => {
    const phases = getMatchesByPhase;
    return phases.length > 0 ? Number(phases[phases.length - 1][0]) : 1;
  }, [getMatchesByPhase]);

  // Helper to get player name by ID
  const getPlayerName = (playerId: number): string => {
    return (
      Players.find((p) => p.id === playerId)?.name || "Jugador desconocido"
    );
  };

  return (
    <div
      className={`card mb-4 shadow-sm ${
        Status ? "border-danger" : "border-success"
      }`}
    >
      {/* Header Section */}
      <div
        className={`card-header ${
          Status ? "bg-danger" : "bg-success"
        } text-white`}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0 d-flex align-items-center">
              <i className="bi bi-trophy-fill me-2"></i>
              <Link
                to={`/tournament/${id}`}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                {name}
              </Link>
            </h5>
            <small className="text-white-50">
              <i className="bi bi-calendar3 me-1"></i>
              {new Date(creationDate).toLocaleDateString()}
            </small>
          </div>
          <div className="text-end">
            <span
              className={`badge bg-light text-${
                Status ? "danger" : "success"
              } mb-1 d-block`}
            >
              {Status ? "Terminado" : "Activo"}
            </span>
            <small className="text-white-50">ID: {id}</small>
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="card-body">
        {/* Scores Section - Show only for active tournaments */}
        {!Status && scores.length > 0 && (
          <section className="mb-4">
            <h6 className="border-bottom pb-2 mb-3">
              <i className="bi bi-star-fill me-2"></i>
              Puntuaciones Actuales
            </h6>
            <div className="list-group">
              {scores
                .sort((a, b) => b.score - a.score)
                .map((score) => (
                  <div
                    key={score.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <span>{getPlayerName(score.player_id)}</span>
                    <span className="badge bg-primary">{score.score} pts</span>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Final Standings Section - Show only for finished tournaments */}
        {Status && scores.length > 0 && (
          <section className="mb-4">
            <h6 className="border-bottom pb-2 mb-3">
              <i className="bi bi-trophy-fill me-2"></i>
              Posiciones Finales
            </h6>
            <div className="list-group">
              {scores
                .sort((a, b) => b.score - a.score)
                .map((score, index) => (
                  <div
                    key={score.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <span
                        className={`badge me-2 ${
                          index === 0
                            ? "bg-warning text-dark"
                            : index === 1
                            ? "bg-silver"
                            : index === 2
                            ? "bg-bronze"
                            : "bg-info"
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <span>{getPlayerName(score.player_id)}</span>
                    </div>
                    <div>
                      <span
                        className={`badge ${
                          index === 0
                            ? "bg-warning text-dark"
                            : index === 1
                            ? "bg-secondary"
                            : index === 2
                            ? "bg-bronze"
                            : "bg-info"
                        }`}
                      >
                        {score.score} pts
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Matches Section */}
        <section className="mb-4">
          <h6 className="border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center">
            <span>
              <i className="bi bi-diagram-3 me-2"></i>
              {type === "Elimination" ? "Fases del Torneo" : "Partidas"}
            </span>
            {type === "Elimination" && (
              <span className="badge bg-secondary">
                Fase actual: {getCurrentPhase}
              </span>
            )}
          </h6>
          {matches.length > 0 ? (
            getMatchesByPhase.map(([phase, phaseMatches]) => (
              <div key={phase} className="mb-4">
                <h6 className="text-muted mb-3">
                  <i className="bi bi-layers me-2"></i>
                  Fase {phase}
                </h6>
                <div className="list-group">
                  {phaseMatches.map((match) => (
                    <Link
                      key={match.id}
                      to={`/match/${match.id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-bold">
                            {getPlayerName(match.player1_id)}
                          </span>
                          <span className="text-muted mx-2">vs</span>
                          <span className="fw-bold">
                            {getPlayerName(match.player2_id)}
                          </span>
                        </div>
                        <div>
                          {match.status ? (
                            match.draw ? (
                              <span className="badge bg-info">Empate</span>
                            ) : (
                              <span className="badge bg-success">
                                Ganador: {getPlayerName(match.win!)}
                              </span>
                            )
                          ) : (
                            <span className="badge bg-warning">Pendiente</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-info">No hay partidas programadas</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default TournamentCard;
