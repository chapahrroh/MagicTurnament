import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface SetMatchWinCardProps {
  matchId: number;
  player1Name: string;
  player2Name: string;
  player1Id: number;
  player2Id: number | null;
  onSuccess: (matchId: number) => void;
}

// Changed to PascalCase for component naming convention
function SetMatchWinCard({
  onSuccess,
  matchId,
  player1Name,
  player2Name,
  player1Id,
  player2Id,
}: SetMatchWinCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedDraw, setSelectedDraw] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPlayerChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlayer(e.target.value);
    // Reset error when user makes a new selection
    if (e.target.value !== "") {
      setSelectedDraw("false");
    }
    setError(null);
  };

  const handleSelectDrawChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedDraw(e.target.value);
    if (e.target.value === "true") {
      setSelectedPlayer(player1Id.toString());
    }
    // Reset error when user makes a new selection
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!selectedPlayer && selectedDraw !== "true") {
      setError("Por favor selecciona un ganador o marca como empate");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await axios.post(
        `http://192.168.56.101:8000/match/${matchId}/${selectedPlayer}/${selectedDraw}`
      );

      if (res.status === 200) {
        onSuccess(matchId);
        setShowModal(false);
        // Reset form
        setSelectedPlayer("");
        setSelectedDraw("");
      }
    } catch (err) {
      setError("Error al guardar el resultado. Por favor intenta de nuevo.");
      console.error("Error setting match winner:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setError(null);
    setSelectedPlayer("");
    setSelectedDraw("");
  };

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => setShowModal(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Guardando...
          </>
        ) : (
          "Definir Ganador"
        )}
      </button>

      {/* Modal */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
        aria-labelledby="matchWinnerModal"
        aria-hidden={!showModal}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="matchWinnerModal">
                Definir Resultado
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleClose}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="winnerSelect" className="form-label">
                    Ganador del Partido
                  </label>
                  <select
                    id="winnerSelect"
                    className="form-select"
                    aria-label="Selecciona el ganador"
                    value={selectedPlayer}
                    onChange={handleSelectPlayerChange}
                    disabled={selectedDraw === "true"}
                  >
                    <option value="">Selecciona el ganador</option>
                    <option value={player1Id}>{player1Name}</option>
                    {player2Id !== null && (
                      <option value={player2Id}>{player2Name}</option>
                    )}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="drawSelect" className="form-label">
                    ¿Es un empate?
                  </label>
                  <select
                    id="drawSelect"
                    className="form-select"
                    aria-label="¿Es un empate?"
                    value={selectedDraw}
                    onChange={handleSelectDrawChange}
                    disabled={selectedPlayer !== ""}
                  >
                    <option value="">Seleccionar</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default SetMatchWinCard;
