import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlayersPage from "./pages/PlayersPage";
import TournamentPage from "./pages/TournamentPage";
import NavBar from "./components/NavBar";
import MatchDetailPage from "./pages/MatchDetailPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import TournamentsDetailPage from "./pages/TournamentsDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/playerContext";
import CreateDeckPage from "./pages/CreateDeckPage";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="container">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/tournaments" element={<TournamentPage />} />
            <Route path="/match/:id" element={<MatchDetailPage />} />
            <Route path="/deck/new" element={<CreateDeckPage />} />
            <Route path="/deck/edit/:deckId" element={<CreateDeckPage />} />

            <Route
              path="/player/:id"
              element={
                <PrivateRoute>
                  <PlayerDetailPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/tournament/:id"
              element={
                <PrivateRoute>
                  <TournamentsDetailPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
