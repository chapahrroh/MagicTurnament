import { useEffect, useState } from "react";
import axios from "axios";
import TournamentCard from "../components/TournamentCard";
import CrearTorneo from "../components/CreateTournament";
import { useAuth } from "../context/playerContext";

// Move types to separate file for better organization
type Tournament = {
  id: number;
  name: string;
  type: string;
  creationDate: string;
  status: boolean;
  players: Player[];
  scores: Score[];
  matches: Match[];
};

type Player = {
  id: number;
  name: string;
  creationDate: string;
  personalScore: number;
  tournament: Tournament[];
};

type Score = {
  id: number;
  player_id: number;
  tournament_id: number;
  score: number;
};

type Match = {
  tournament_id: number;
  player1_id: number;
  win: number | null;
  draw: boolean;
  id: number;
  player2_id: number;
  status: boolean;
  phase: number; // Added the missing 'phase' property
};

function TournamentPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "finished">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated } = useAuth();

  const fetchTournament = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get<Tournament[]>(
        "http://192.168.56.101:8000/tournament"
      );
      setTournaments(res.data);
    } catch (error) {
      setError("Error al cargar los torneos");
      console.error("Error fetching tournaments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTournament();
  }, []);

  const filteredTournaments = tournaments
    .filter((tournament) => {
      if (filter === "active") return !tournament.status;
      if (filter === "finished") return tournament.status;
      return true;
    })
    .filter((tournament) =>
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">Torneos</h1>
            {isAuthenticated ? (
              <CrearTorneo onSuccess={fetchTournament} />
            ) : (
              <button
                className="btn btn-primary"
                disabled
                title="Inicia sesión para crear un torneo"
              >
                <i className="bi bi-lock me-2"></i>
                Crear Torneo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar torneo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="btn-group">
            <button
              className={`btn btn${filter === "all" ? "" : "-outline"}-primary`}
              onClick={() => setFilter("all")}
            >
              Todos
            </button>
            <button
              className={`btn btn${
                filter === "active" ? "" : "-outline"
              }-primary`}
              onClick={() => setFilter("active")}
            >
              En curso
            </button>
            <button
              className={`btn btn${
                filter === "finished" ? "" : "-outline"
              }-primary`}
              onClick={() => setFilter("finished")}
            >
              Finalizados
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!isLoading && !error && filteredTournaments.length === 0 && (
        <div className="alert alert-info" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          {searchTerm
            ? "No se encontraron torneos que coincidan con la búsqueda."
            : "No hay torneos disponibles."}
        </div>
      )}

      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        {filteredTournaments.map((tournament) => (
          <div className="col" key={tournament.id}>
            <TournamentCard
              key={tournament.id}
              onSuccess={fetchTournament}
              type={tournament.type}
              Players={tournament.players}
              id={tournament.id}
              name={tournament.name}
              creationDate={tournament.creationDate}
              Status={tournament.status}
              scores={tournament.scores}
              matches={tournament.matches}
            />
          </div>
        ))}
      </div>

      {filteredTournaments.length > 0 && (
        <div className="text-muted text-center mt-4">
          Mostrando {filteredTournaments.length} torneos de {tournaments.length}
        </div>
      )}
    </div>
  );
}

export default TournamentPage;
