import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface Player {
  id: number;
  name: string;
  personalScore: number;
}

interface Tournament {
  id: number;
  name: string;
  status: boolean;
  type: string;
}

function HomePage() {
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [recentTournaments, setRecentTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [playersRes, tournamentsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_SERVER}/player`),
          axios.get(`${import.meta.env.VITE_BACKEND_SERVER}/tournament`),
        ]);

        setTopPlayers(
          playersRes.data
            .sort((a: Player, b: Player) => b.personalScore - a.personalScore)
            .slice(0, 5)
        );
        setRecentTournaments(tournamentsRes.data.slice(0, 3));
      } catch (error) {
        setError("Error cargando datos");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="text-center mb-4">Magic Tournament Manager</h1>
        </div>
      </div>

      <div className="row g-4">
        {/* Top Players Section */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title h5 mb-0">
                <i className="bi bi-trophy me-2"></i>
                Top Jugadores
              </h3>
            </div>
            <div className="card-body">
              <div className="list-group">
                {topPlayers.map((player, index) => (
                  <Link
                    key={player.id}
                    to={`/player/${player.id}`}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <span
                        className={`badge bg-${
                          index < 3
                            ? ["warning", "silver", "bronze"][index]
                            : "info"
                        } me-2`}
                      >
                        #{index + 1}
                      </span>
                      {player.name}
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {player.personalScore} pts
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tournaments Section */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              <h3 className="card-title h5 mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Torneos Recientes
              </h3>
            </div>
            <div className="card-body">
              <div className="list-group">
                {recentTournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    to={`/tournament/${tournament.id}`}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-0">{tournament.name}</h6>
                      <small className="text-muted">{tournament.type}</small>
                    </div>
                    <span
                      className={`badge bg-${
                        tournament.status ? "success" : "warning"
                      }`}
                    >
                      {tournament.status ? "Finalizado" : "En curso"}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h3 className="card-title h5 mb-0">
                <i className="bi bi-lightning me-2"></i>
                Acciones Rápidas
              </h3>
            </div>
            <div className="card-body">
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/tournament/new" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Nuevo Torneo
                </Link>
                <Link to="/players" className="btn btn-success">
                  <i className="bi bi-person-plus me-2"></i>
                  Gestionar Jugadores
                </Link>
                <Link to="/tournaments" className="btn btn-info text-white">
                  <i className="bi bi-list-ul me-2"></i>
                  Ver Todos los Torneos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
