import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

interface CrearTorneoProps {
  onSuccess: () => void;
}

function CrearTorneo(props: CrearTorneoProps) {
  const { onSuccess } = props;
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState("");
  const [selectedOption, setSelectedOption] = useState("elimination");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(e.target.value);
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await axios.post(`${import.meta.env.VITE_BACKEND_SERVER}/tournament`, {
      name: formData,
      type: selectedOption,
    });

    console.log(res);
    setFormData("");
    setSelectedOption("elimination");
    setShowModal(false);
    onSuccess();
  };

  return (
    <div>
      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        Crear Torneo
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
              <h5 className="modal-title">Nuevo Jugador</h5>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre</label>
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
              <div className="modal-body">
                <select
                  className="form-select"
                  aria-label="Seleccionar tipo de torneo"
                  value={selectedOption}
                  onChange={handleSelectChange}
                >
                  <option value="elimination">Eliminatorias</option>
                  <option value="roundRobin">Round Robin</option>
                </select>
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

export default CrearTorneo;
