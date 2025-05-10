import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/playerContext";
import * as bootstrap from "bootstrap";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const dropdownRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (dropdownRef.current) {
      const dropdown = new bootstrap.Dropdown(dropdownRef.current, {
        autoClose: true,
      });

      return () => {
        dropdown.dispose();
      };
    }
  }, [isAuthenticated]);

  const isActive = (path: string): string => {
    return location.pathname === path ? "active" : "";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            style={{
              borderRadius: "50%",
              boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)", // Más brillo
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1.1)";
              (e.target as HTMLImageElement).style.boxShadow =
                "0 0 20px rgba(255, 255, 255, 0.8)"; // Más intenso al hacer hover
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLImageElement).style.transform = "scale(1)";
              (e.target as HTMLImageElement).style.boxShadow =
                "0 0 15px rgba(255, 255, 255, 0.5)";
            }}
          />
          <span
            className="fs-4"
            style={{ fontWeight: "bold", color: "inherit" }}
          >
            MTG Tournament Traker
          </span>
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive(
                  "/"
                )} d-flex align-items-center`}
                to="/"
                style={{
                  transition: "color 0.3s ease", // Transición para color
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#ffd700")
                } // Efecto hover color dorado
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "inherit")
                }
              >
                <i
                  className="ms ms-chaos ms-1x ms-cost ms-shadow me-2"
                  style={{ color: "inherit", background: "transparent" }}
                  aria-label="Home symbol"
                  title="Home"
                ></i>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive(
                  "/players"
                )} d-flex align-items-center`}
                to="/players"
                style={{
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#ffd700")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "inherit")
                }
              >
                <i
                  className="ms ms-planeswalker ms-1x ms-cost ms-shadow me-2"
                  style={{ color: "inherit", background: "transparent" }}
                  aria-label="Planeswalker symbol"
                  title="Planeswalker"
                ></i>
                Jugadores
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive(
                  "/tournaments"
                )} d-flex align-items-center`}
                to="/tournaments"
                style={{
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.target as HTMLElement).style.color = "#ffd700")
                }
                onMouseLeave={(e) =>
                  ((e.target as HTMLElement).style.color = "inherit")
                }
              >
                <i
                  className="ms ms-artifact ms-1x ms-cost ms-shadow me-2"
                  style={{ color: "inherit", background: "transparent" }}
                  aria-label="Artifact symbol"
                  title="Artifact"
                ></i>
                Torneos
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav ms-auto">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive(
                      "/login"
                    )} d-flex align-items-center`}
                    to="/login"
                    style={{
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "inherit")
                    }
                  >
                    <i
                      className="ms ms-guild-azorius ms-1x me-2"
                      style={{ color: "inherit", background: "transparent" }}
                      aria-label="Login symbol"
                      title="Login"
                    ></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive(
                      "/register"
                    )} d-flex align-items-center`}
                    to="/register"
                    style={{
                      transition: "color 0.3s ease",
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffd700")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "inherit")
                    }
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <button
                  ref={dropdownRef}
                  className="nav-link dropdown-toggle btn btn-link d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  {user?.name}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to={`/player/${user?.id}`}>
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
