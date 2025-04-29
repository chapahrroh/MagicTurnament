import { Link } from "react-router-dom";
import { PlayerCardProps } from "../Types/Types";

function PlayerCard({
  id,
  name,
  creationDate,
  personalScore,
  tournament = [],
}: PlayerCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="card h-100 shadow-sm hover-shadow">
      {/* Header Section */}
      <div className="card-header bg-primary text-white position-relative">
        <h5 className="card-title mb-0 d-flex align-items-center">
          <i className="bi bi-person-circle me-2"></i>
          <Link
            to={`/player/${id}`}
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            {name}
          </Link>
        </h5>
        <small className="position-absolute top-0 end-0 m-2 text-white-50">
          ID: {id}
        </small>
      </div>

      <div className="card-body d-flex flex-column">
        {/* Player Info Section */}
        <div className="mb-4">
          <div className="text-muted mb-3">
            <i className="bi bi-calendar3 me-2"></i>
            {formatDate(creationDate)}
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="badge bg-warning text-dark p-2">
              <i className="bi bi-trophy-fill me-2"></i>
              <span className="h6 mb-0">{personalScore} puntos</span>
            </div>
            <div className="badge bg-info p-2">
              <i className="bi bi-controller me-2"></i>
              <span className="h6 mb-0">{tournament.length} torneos</span>
            </div>
          </div>
        </div>

        {/* Tournaments Section */}
        <div className="flex-grow-1">
          <h6 className="border-bottom pb-2 mb-3 d-flex align-items-center">
            <i className="bi bi-list-stars me-2"></i>
            Torneos
          </h6>

          {tournament.length > 0 ? (
            <div className="list-group">
              {tournament.map((t) => (
                <div
                  key={t.id}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                >
                  <div>
                    <h6 className="mb-0">{t.name}</h6>
                    <small className="text-muted">
                      <i className="bi bi-diagram-3 me-1"></i>
                      {t.type}
                    </small>
                  </div>
                  <span
                    className={`badge ${
                      t.status ? "bg-danger" : "bg-success"
                    } d-flex align-items-center`}
                  >
                    <i
                      className={`bi bi-${
                        t.status ? "flag-fill" : "play-fill"
                      } me-1`}
                    ></i>
                    {t.status ? "Finalizado" : "Activo"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-info d-flex align-items-center">
              <i className="bi bi-info-circle-fill me-2"></i>
              No participa en ningún torneo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlayerCard;
