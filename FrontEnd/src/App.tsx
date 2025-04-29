import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlayersPage from "./pages/PlayersPage";
import TournamentPage from "./pages/TournamentPage";
import NavBar from "./components/NavBar";
import MatchDetailPage from "./pages/MatchDetailPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import TournamentsDetailPage from "./pages/TournamentsDetailPage";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="container">
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/tournaments" element={<TournamentPage />} />
            <Route path="/match/:id" element={<MatchDetailPage />} />
            <Route path="/player/:id" element={<PlayerDetailPage />} />
            <Route path="/tournament/:id" element={<TournamentsDetailPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
