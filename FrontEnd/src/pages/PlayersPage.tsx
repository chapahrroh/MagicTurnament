import { useEffect, useState } from "react";
import PlayerCard from "../components/PlayerCard";
import { Player } from "../Types/Types";
import { fetchPlayers } from "../api/apiRequests";

function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadPlayers = async () => {
    setIsLoading(true);
    setError(null);
    const { Players: fetchedPlayers, error: fetchError } = await fetchPlayers();
    if (fetchedPlayers) {
      setPlayers(fetchedPlayers);
    } else {
      setPlayers([]);
    }
    setError(fetchError);
    setIsLoading(false);
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">Jugadores</h1>
            {/* <div className="d-flex gap-2">
              <CrearJugador onSuccess={fetchPlayers} />
              <DeletPlayer onSuccess={fetchPlayers} />
            </div> */}
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
              placeholder="Buscar jugador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 text-end">
          <span className="text-muted">
            Total de jugadores: {players.length}
          </span>
        </div>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No se encontraron jugadores
          {searchTerm && " que coincidan con la búsqueda"}
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filteredPlayers.map((player) => (
            <div className="col" key={player.id}>
              <PlayerCard
                id={player.id.toString()}
                creationDate={player.creationDate}
                name={player.name}
                personalScore={player.personalScore}
                tournament={player.tournament}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlayersPage;
