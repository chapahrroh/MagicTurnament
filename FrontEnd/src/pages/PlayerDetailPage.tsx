import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Tournament {
  id: number;
  name: string;
  type: string;
  status: boolean;
  creationDate: string;
}

interface Player {
  id: number;
  name: string;
  creationDate: string;
  personalScore: number;
  tournament: Tournament[];
}

function PlayerDetailPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://192.168.56.101:8000/player/${id}`
        );
        setPlayer(response.data);
        console.log("Player data:", response.data);
      } catch (error) {
        setError("Error al cargar el jugador");
        console.error("Error fetching player:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayer();
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
      <div className="row">
        {/* Player Profile Section */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              {/* Avatar placeholder - for future implementation */}
              <div className="mb-4">
                <div className="rounded-circle bg-light d-inline-flex p-4 mb-3">
                  <i className="bi bi-person-circle display-1"></i>
                </div>
                <h2 className="mb-0">{player.name}</h2>
                <small className="text-muted">ID: {player.id}</small>
              </div>

              <div className="border-top pt-3">
                <div className="row text-center">
                  <div className="col">
                    <h3 className="h5 mb-1">{player.personalScore}</h3>
                    <small className="text-muted">Puntos Totales</small>
                  </div>
                  <div className="col">
                    <h3 className="h5 mb-1">
                      {player.tournament?.length || 0}
                    </h3>
                    <small className="text-muted">Torneos</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament History Section */}
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h3 className="h5 mb-0">
                <i className="bi bi-trophy me-2"></i>
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
    </div>
  );
}

export default PlayerDetailPage;
