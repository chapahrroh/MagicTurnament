import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/playerContext";
import { Player, Tournament } from "../Types/Types";

function HomePage() {
  const { isAuthenticated } = useAuth();
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [recentTournaments, setRecentTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [playersRes, tournamentsRes] = await Promise.all([
          axios.get("http://192.168.56.101:8000/player"),
          axios.get("http://192.168.56.101:8000/tournament"),
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
    const fetchCard = async () => {
      try {
        const response = await axios.get(
          "https://api.scryfall.com/cards/random"
        );
        setCards((prev) => {
          const updated = [...prev, response.data];
          return updated.length > 3 ? updated.slice(-3) : updated;
        });
      } catch (err) {
        console.error("Error fetching card:", err);
      }
    };

    fetchCard();
    const interval = setInterval(fetchCard, 4000); // cada 4s entra una nueva
    return () => clearInterval(interval);
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
      {/* Stats Overview */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card bg-primary bg-gradient text-white">
            <div className="card-body text-center">
              <i className="ms ms-w ms-3x ms-cost mb-3"></i>
              <h3 className="h2 mb-0">{topPlayers.length}</h3>
              <p className="mb-0">Jugadores Registrados</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success bg-gradient text-white">
            <div className="card-body text-center">
              <i className="ms ms-g ms-3x ms-cost mb-3"></i>
              <h3 className="h2 mb-0">{recentTournaments.length}</h3>
              <p className="mb-0">Torneos Realizados</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info bg-gradient text-white">
            <div className="card-body text-center">
              <i className="ms ms-u ms-3x ms-cost mb-3"></i>
              <h3 className="h2 mb-0">
                {topPlayers.reduce(
                  (acc, player) => acc + player.personalScore,
                  0
                )}
              </h3>
              <p className="mb-0">Puntos Totales</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Top Players Section - Updated */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-dark text-white">
              <h3 className="card-title h5 mb-0">
                <i className="ms ms-commander ms-1x ms-cost ms-shadow me-2"></i>
                Top Jugadores
              </h3>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {topPlayers.map((player, index) => (
                  <Link
                    key={player.id}
                    to={`/player/${player.id}`}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      <span className="position-relative me-3">
                        <i
                          className={`ms ms-${
                            ["r", "w", "u"][index] || "b"
                          } ms-2x ms-cost ms-shadow`}
                        ></i>
                        <small className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
                          #{index + 1}
                        </small>
                      </span>
                      <div>
                        <h6 className="mb-0">{player.name}</h6>
                        <small className="text-muted">
                          Ranking #{index + 1}
                        </small>
                      </div>
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

        {/* Recent Tournaments Section - Updated */}
        <div className="col-md-6">
          <div className="card shadow-sm h-100 border-0">
            <div className="card-header bg-dark text-white">
              <h3 className="card-title h5 mb-0">
                <i className="ms ms-dci ms-1x ms-cost ms-shadow me-2"></i>
                Torneos Recientes
              </h3>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {recentTournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    to={`/tournament/${tournament.id}`}
                    className="list-group-item list-group-item-action"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">
                          <i
                            className={`ms ms-${tournament.type.toLowerCase()} ms-1x ms-cost ms-shadow me-2`}
                          ></i>
                          {tournament.name}
                        </h6>
                        <small className="text-muted">{tournament.type}</small>
                      </div>
                      <span
                        className={`badge bg-${
                          tournament.status ? "success" : "warning"
                        }`}
                      >
                        {tournament.status ? "Finalizado" : "En curso"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Random Cards Section - Updated */}
        <div className="col-12">
          <div className="card shadow-sm border-0 overflow-hidden">
            <div className="card-header bg-dark text-white">
              <h3 className="card-title h5 mb-0">
                <i className="ms ms-ability ms-1x ms-cost ms-shadow me-2"></i>
                Cartas Destacadas
              </h3>
            </div>
            <div className="card-body bg-dark">
              <div className="d-flex justify-content-center align-items-center gap-4">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="card-hover-effect"
                    style={{
                      transform: `rotate(${(index - 1) * 5}deg)`,
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <img
                      src={card.image_uris?.normal || card.image_uris?.art_crop}
                      alt={card.name}
                      className="rounded shadow-lg"
                      style={{
                        width: "200px",
                        height: "auto",
                        animation: `fadeIn 0.5s ease ${index * 0.2}s forwards`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Updated */}
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white">
              <h3 className="card-title h5 mb-0">
                <i className="ms ms-instant ms-1x ms-cost ms-shadow me-2"></i>
                Acciones Rápidas
              </h3>
            </div>
            <div className="card-body">
              <div className="d-flex gap-3 flex-wrap justify-content-center">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/tournament/new"
                      className="btn btn-primary btn-lg"
                    >
                      <i className="ms ms-planeswalker ms-1x ms-cost ms-shadow me-2"></i>
                      Nuevo Torneo
                    </Link>
                    <Link to="/players" className="btn btn-success btn-lg">
                      <i className="ms ms-multiple ms-1x ms-cost ms-shadow me-2"></i>
                      Gestionar Jugadores
                    </Link>
                  </>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    <i className="ms ms-planeswalker ms-1x ms-cost ms-shadow me-2"></i>
                    Iniciar Sesión
                  </Link>
                )}
                <Link
                  to="/tournaments"
                  className="btn btn-info btn-lg text-white"
                >
                  <i className="ms ms-dci ms-1x ms-cost ms-shadow me-2"></i>
                  Ver Torneos
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
