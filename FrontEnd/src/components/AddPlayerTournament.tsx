import axios from "axios";
import { useState, ChangeEvent, FormEvent } from "react";

interface AddPlayerTournamentProps {
  status: boolean;
  onSuccess: () => void;
  tournament_id: string;
  hasMatches: boolean; // Add this new prop
}

function AddPlayerTournament(props: AddPlayerTournamentProps) {
  const { onSuccess, tournament_id, status, hasMatches } = props;
  const [showModal, setShowModal] = useState(false);
  //   const [tournament_id, setTournaments] = useState("");
  const [player_id, setPlayer] = useState("");

  //   const handleInputTournamentChange = (e: ChangeEvent<HTMLInputElement>) => {
  //     setTournaments(e.target.value);
  //   };
  const handleInputPlayerChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPlayer(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_SERVER}/tournament/${tournament_id}/player/${player_id}`
    );

    console.log(res);
    // setTournaments("");
    setPlayer("");
    setShowModal(false);
    onSuccess();
  };

  return (
    <div>
      <button
        className="btn btn-primary"
        onClick={() => setShowModal(true)}
        disabled={status || hasMatches} // Add hasMatches to disabled condition
      >
        Agregar Jugador
      </button>

      {/* Modal */}
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        style={{ display: showModal ? "block" : "none" }}
        tabIndex={-1}
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Agregar Jugador a torneo</h5>
            </div>

            <form onSubmit={handleSubmit}>
              {/* <div className="modal-body">
                <div className="form-group">
                  <label>Torneo ID</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    required
                    value={tournament_id}
                    onChange={handleInputTournamentChange}
                  />
                </div>
              </div> */}
              <div className="modal-body">
                <div className="form-group">
                  <label>Player ID</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    required
                    value={player_id}
                    onChange={handleInputPlayerChange}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Fondo oscuro del modal */}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}

export default AddPlayerTournament;
