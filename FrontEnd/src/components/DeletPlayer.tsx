import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface CrearJugadorProps {
  onSuccess: () => void;
}

function CrearJugador(props: CrearJugadorProps) {
  const { onSuccess } = props;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await axios.delete(
      `http://192.168.56.101:8000/player/${formData}`
    );
    console.log(res);
    setFormData("");
    setShowModal(false);
    onSuccess();
  };

  return (
    <div>
      <button className="btn btn-danger" onClick={() => setShowModal(true)}>
        Eliminar Jugador
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
              <h5 className="modal-title">Id del Jugador a eliminar</h5>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>ID</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre"
                    required
                    value={formData}
                    onChange={handleInputChange}
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
                <button type="submit" className="btn btn-danger">
                  Eliminar
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

export default CrearJugador;
