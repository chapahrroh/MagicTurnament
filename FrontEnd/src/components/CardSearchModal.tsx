import React, { useState } from "react";
import axios from "axios";
import { CardData as ScryfallCard } from "../Types/Types";

interface CardSearchModalProps {
  show: boolean;
  onHide: () => void;
  onAddCard: (card: ScryfallCard) => void;
}

function CardSearchModal({ show, onHide, onAddCard }: CardSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ScryfallCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
          searchTerm
        )}`
      );
      setSearchResults(response.data.data);
    } catch (error) {
      console.error("Error searching cards:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`modal ${show ? "show d-block" : ""}`} tabIndex={-1}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              <i className="ms ms-ability ms-1x ms-cost ms-shadow me-2"></i>
              Buscar Cartas
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={searchCards} className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar cartas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-search me-2"></i>
                  Buscar
                </button>
              </div>
            </form>

            {isSearching ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Buscando...</span>
                </div>
              </div>
            ) : (
              <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
                {searchResults.map((card) => (
                  <div key={card.id} className="col">
                    <div className="card h-100 border-0 shadow-sm card-hover-effect bg-dark">
                      <img
                        src={
                          card.image_uris?.normal ||
                          card.card_faces?.[0].image_uris.normal
                        }
                        className="card-img-top"
                        alt={card.name}
                      />
                      <div className="card-body">
                        <h6 className="card-title mb-2">{card.name}</h6>
                        <button
                          className="btn btn-sm btn-primary w-100"
                          onClick={() => {
                            onAddCard(card);
                            setSearchTerm("");
                            setSearchResults([]);
                          }}
                        >
                          <i className="ms ms-counter ms-1x ms-cost ms-shadow me-2"></i>
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardSearchModal;
