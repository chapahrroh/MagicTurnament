import { Link, useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();

  const isActive = (path: string): string => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="/logo.png"
            alt="Logo"
            width="40"
            height="40"
            className="d-inline-block align-text-top me-2"
          />
          <span className="fs-4">MTG Tournament Manager</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive(
                  "/"
                )} d-flex align-items-center`}
                to="/"
              >
                <i className="bi bi-house-door me-2"></i>
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive(
                  "/players"
                )} d-flex align-items-center`}
                to="/players"
              >
                <i className="bi bi-people me-2"></i>
                Jugadores
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive(
                  "/tournaments"
                )} d-flex align-items-center`}
                to="/tournaments"
              >
                <i className="bi bi-trophy me-2"></i>
                Torneos
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
