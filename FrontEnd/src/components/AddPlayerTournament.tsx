import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/playerContext";

interface AddPlayerTournamentProps {
  status: boolean;
  onSuccess: () => void;
  tournament_id: string;
  hasMatches: boolean;
  players: Array<{ id: number; name: string }>;
}

function AddPlayerTournament({
  status,
  onSuccess,
  tournament_id,
  hasMatches,
  players,
}: AddPlayerTournamentProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && players) {
      setIsRegistered(players.some((player) => player.id === user.id));
    }
  }, [isAuthenticated, user, players]);

  const handleRegister = async () => {
    if (!isAuthenticated || !user) {
      setError("Debes iniciar sesión para inscribirte");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await axios.post(
        `http://192.168.56.101:8000/tournament/${tournament_id}/player/${user.id}`
      );

      onSuccess();
    } catch (error: any) {
      console.error("Error registering to tournament:", error);
      if (error.response?.status === 404) {
        setError("Torneo no encontrado");
      } else if (
        error.response?.data?.message === "This player is in the tournament"
      ) {
        setError("Ya estás inscrito en este torneo");
      } else {
        setError(
          error.response?.data?.detail || "Error al inscribirse al torneo"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status || hasMatches) {
    return null;
  }

  return (
    <div>
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-3"
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

      <button
        className={`btn ${isRegistered ? "btn-success" : "btn-primary"}`}
        onClick={handleRegister}
        disabled={isLoading || !isAuthenticated || isRegistered}
        title={
          !isAuthenticated
            ? "Debes iniciar sesión para inscribirte"
            : isRegistered
            ? "Ya estás inscrito en este torneo"
            : ""
        }
      >
        {isLoading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Inscribiendo...
          </>
        ) : isRegistered ? (
          <>
            <i className="bi bi-check-circle me-2"></i>
            Inscrito
          </>
        ) : (
          <>
            <i className="ms ms-planeswalker ms-1x ms-cost ms-shadow me-2"></i>
            Inscribirse
          </>
        )}
      </button>
    </div>
  );
}

export default AddPlayerTournament;
