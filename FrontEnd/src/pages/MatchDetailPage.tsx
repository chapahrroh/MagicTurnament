import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import SetMatchWinCard from "../components/SetMatchWinCard";
import axios from "axios";
import { Matches, Player } from "../Types/Types";

function MatchDetail() {
  const { id } = useParams();
  const [match, setMatch] = useState<Matches | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [player1Name, setPlayer1Name] = useState<string>("");
  const [player2Name, setPlayer2Name] = useState<string>("");

  const fetchMatch = async (matchId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(
        `http://192.168.56.101:8000/match/${matchId}`
      );
      if (res.data && res.data.length > 0) {
        setMatch(res.data[0]);
        // Fetch player names
        await fetchPlayerNames(res.data[0].player1_id, res.data[0].player2_id);
      } else {
        setError("Partido no encontrado");
      }
    } catch (error) {
      setError("Error al cargar los detalles del partido");
      console.error("Error fetching match:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayerNames = async (
    player1Id: number,
    player2Id: number | null
  ) => {
    try {
      const player1Res = await axios.get<Player>(
        `http://192.168.56.101:8000/player/${player1Id}`
      );
      if (player1Res.data) {
        setPlayer1Name(player1Res.data.name); // Updated from nombre to name
      }

      if (player2Id) {
        const player2Res = await axios.get<Player>(
          `http://192.168.56.101:8000/player/${player2Id}`
        );
        if (player2Res.data) {
          setPlayer2Name(player2Res.data.name); // Updated from nombre to name
        }
      }
    } catch (error) {
      console.error("Error fetching player names:", error);
      setError("Error al cargar los nombres de los jugadores");
    }
  };

  useEffect(() => {
    const matchId = parseInt(id || "0", 10);
    if (matchId > 0) {
      fetchMatch(matchId);
    } else {
      setError("ID de partido inválido");
      setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {match && (
        <>
          <div
            className="card text-white text-center mb-4"
            style={{
              backgroundImage: "url('/vs-background.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "60px",
              borderRadius: "15px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Content with higher z-index to appear above overlay */}
            <div className="container">
              <div className="row text-center">
                <div className="col-6 d-flex justify-content-center align-items-center">
                  <h1 className="display-4 fw-bold">{player1Name}</h1>
                </div>
                <div className="col-6 d-flex justify-content-center align-items-center">
                  <h1 className="display-4 fw-bold ">{player2Name}</h1>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h2 className="mb-0">Partida #{match.id}</h2>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h4 className="card-subtitle mb-3 text-muted">
                    Detalles de la Partida
                  </h4>
                  <div className="list-group">
                    <div className="list-group-item">
                      <strong>Jugador 1:</strong> {player1Name}
                    </div>
                    <div className="list-group-item">
                      <strong>Jugador 2:</strong> {player2Name || "No asignado"}
                    </div>
                    <div className="list-group-item">
                      <strong>Estado:</strong>{" "}
                      <span
                        className={`badge text-bg-${
                          match.status ? "success" : "warning"
                        }`}
                      >
                        {match.status ? "Jugado" : "Pendiente"}
                      </span>
                    </div>
                    {match.status && (
                      <>
                        <div className="list-group-item">
                          <strong>Resultado:</strong>{" "}
                          {match.draw ? (
                            <span className="badge text-bg-info">Empate</span>
                          ) : match.win ? (
                            <span className="badge text-bg-success">
                              Ganador:{" "}
                              {match.win === match.player1_id
                                ? player1Name
                                : player2Name}
                            </span>
                          ) : (
                            "No registrado"
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    {!match.status && (
                      <SetMatchWinCard
                        matchId={match.id}
                        player1Name={player1Name}
                        player1Id={match.player1_id}
                        player2Name={player2Name}
                        player2Id={match.player2_id}
                        onSuccess={() => fetchMatch(match.id)}
                      />
                    )}
                    <button
                      className="btn btn-danger"
                      onClick={() => window.history.back()}
                    >
                      Volver a torneos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MatchDetail;
