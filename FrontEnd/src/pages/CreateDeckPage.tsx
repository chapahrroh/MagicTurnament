import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/playerContext";
import CardSearchModal from "../components/CardSearchModal"; // Adjust the path as needed
import {
  ScryfallCard,
  DeckCard,
  DeckFormData,
  CardEntry,
} from "../Types/interface"; // Adjust the path as needed

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const parseDeckList = async (deckList: string): Promise<DeckCard[]> => {
  try {
    const lines = deckList
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const cards: DeckCard[] = [];
    const failedCards: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^(\d+)\s+([^(]+)(?:\s+\(([^)]+)\))?/);

      if (!match) {
        console.warn(`Invalid line format: ${line}`);
        continue;
      }

      const [, quantity, cardName, setCode] = match;
      let searchQuery = cardName.trim();
      if (setCode) {
        searchQuery += ` set:${setCode.split(")")[0]}`;
      }

      try {
        await delay(100);

        const response = await axios.get(
          `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
            searchQuery
          )}`,
          {
            timeout: 10000,
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        cards.push({
          id: response.data.id,
          name: response.data.name,
          quantity: parseInt(quantity),
          image:
            response.data.image_uris?.small ||
            response.data.card_faces?.[0].image_uris.small ||
            "",
        });

        console.log(`Processed ${i + 1}/${lines.length}: ${cardName}`);
      } catch (error) {
        console.error(`Error fetching card: ${cardName}`, error);
        failedCards.push(cardName);

        if (axios.isAxiosError(error) && error.response?.status === 429) {
          console.log("Rate limited, waiting...");
          await delay(1000);
        }
      }
    }

    if (failedCards.length > 0) {
      console.warn("Failed to fetch these cards:", failedCards);
      alert(
        `No se pudieron importar ${
          failedCards.length
        } cartas:\n${failedCards.join("\n")}`
      );
    }

    return cards;
  } catch (error) {
    console.error("Error parsing deck list:", error);
    throw new Error("Error al procesar la lista de cartas");
  }
};

const ImportDeckList = ({
  onImport,
}: {
  onImport: (cards: DeckCard[]) => void;
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setProgress("Leyendo archivo...");

      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      setProgress(`Procesando ${lines.length} cartas...`);

      const cards = await parseDeckList(text);
      setProgress(`Importadas ${cards.length} cartas`);
      onImport(cards);
    } catch (error) {
      console.error("Error importing deck list:", error);
      alert("Error al importar la lista de cartas");
    } finally {
      setIsImporting(false);
      setProgress("");
      event.target.value = "";
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label d-flex align-items-center gap-2">
        <i className="ms ms-ability-exploit ms-1x ms-cost ms-shadow"></i>
        Importar Lista
      </label>
      <div className="input-group">
        <input
          type="file"
          className="form-control"
          accept=".txt"
          onChange={handleFileSelect}
          disabled={isImporting}
        />
        {isImporting && (
          <span className="input-group-text">
            <div
              className="spinner-border spinner-border-sm me-2"
              role="status"
            >
              <span className="visually-hidden">Importando...</span>
            </div>
            {progress}
          </span>
        )}
      </div>
      <small className="text-muted d-block mt-1">
        Formato: "1 Nombre de la Carta (SET) 123"
      </small>
    </div>
  );
};

function CreateDeckPage() {
  const { deckId } = useParams(); // Get deckId from URL if editing
  const isEditing = Boolean(deckId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCards, setSelectedCards] = useState<DeckCard[]>([]);
  const [formData, setFormData] = useState<DeckFormData>({
    deckName: "",
    format: "",
    deckDescription: "",
  });
  const [isLoading, setIsLoading] = useState(isEditing);
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    console.log("DeckId:", deckId);
    console.log("IsEditing:", isEditing);
    console.log("User:", user);

    const loadDeckData = async () => {
      if (!deckId || !user) {
        console.log("Missing deckId or user");
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching deck data for id:", deckId);

        const response = await axios.get<{
          deckName: string;
          format: string;
          deckDescription: string;
          deckList: string;
          player_id: number;
        }>(`http://192.168.56.101:8000/decks/${deckId}`);

        console.log("Deck data received:", response.data);
        const deck = response.data;

        if (deck.player_id !== user.id) {
          navigate("/");
          return;
        }

        setFormData({
          deckName: deck.deckName,
          format: deck.format,
          deckDescription: deck.deckDescription,
        });

        const cardEntries: CardEntry[] = deck.deckList
          .split("\n")
          .filter((line): line is string => Boolean(line.trim()))
          .map((line) => {
            const [quantity, id] = line.trim().split(" ");
            return {
              quantity: parseInt(quantity) || 1,
              id: id?.trim() || "",
            };
          })
          .filter((entry): entry is CardEntry => Boolean(entry.id));

        if (cardEntries.length > 0) {
          try {
            const uniqueCardIds = Array.from(
              new Set(cardEntries.map((entry) => entry.id))
            );
            const cardDetails = new Map<string, ScryfallCard>();

            for (let i = 0; i < uniqueCardIds.length; i += 75) {
              const batch = uniqueCardIds.slice(i, i + 75);
              const response = await axios.post<{ data: ScryfallCard[] }>(
                "https://api.scryfall.com/cards/collection",
                {
                  identifiers: batch.map((id) => ({ id })),
                }
              );

              response.data.data.forEach((card) => {
                cardDetails.set(card.id, card);
              });

              if (i + 75 < uniqueCardIds.length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
              }
            }

            const selectedCardsData: DeckCard[] = cardEntries
              .filter((entry) => cardDetails.has(entry.id))
              .map((entry) => {
                const card = cardDetails.get(entry.id)!;
                return {
                  id: entry.id,
                  name: card.name,
                  quantity: entry.quantity,
                  image:
                    card.image_uris?.small ||
                    card.card_faces?.[0]?.image_uris?.small ||
                    "",
                };
              });

            setSelectedCards(selectedCardsData);
          } catch (error) {
            console.error("Error fetching card details:", error);
            alert(
              "Error al cargar los detalles de las cartas. Por favor, intente nuevamente."
            );
          }
        }
      } catch (error) {
        console.error("Error loading deck:", error);
        alert("Error al cargar el mazo. Por favor, intente nuevamente.");
        navigate(`/player/${user.id}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditing) {
      loadDeckData();
    }
  }, [deckId, user, navigate]);

  const addCard = (card: ScryfallCard) => {
    setSelectedCards((prev) => {
      // Check if card already exists in deck
      const existingCardIndex = prev.findIndex((c) => c.id === card.id);

      if (existingCardIndex !== -1) {
        // Update quantity of existing card
        const updatedCards = [...prev];
        updatedCards[existingCardIndex] = {
          ...updatedCards[existingCardIndex],
          quantity: updatedCards[existingCardIndex].quantity + 1,
        };
        return updatedCards;
      }

      // Add new card with quantity 1
      return [
        ...prev,
        {
          id: card.id,
          name: card.name,
          quantity: 1,
          image:
            card.image_uris?.small ||
            card.card_faces?.[0]?.image_uris?.small ||
            "",
        },
      ];
    });
  };

  const removeCard = (cardId: string) => {
    setSelectedCards((prev) => prev.filter((card) => card.id !== cardId));
  };

  const updateCardQuantity = (cardId: string, quantity: number) => {
    setSelectedCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, quantity: Math.max(1, quantity) } : card
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const deckList = selectedCards
        .map((card) => `${card.quantity} ${card.id}`)
        .join("\n");

      const deckData = {
        ...formData,
        player_id: user.id,
        deckList,
        creationDate: isEditing ? undefined : new Date().toISOString(),
      };

      if (isEditing) {
        await axios.patch(
          `http://192.168.56.101:8000/decks/${deckId}`,
          deckData
        );
      } else {
        await axios.post("http://192.168.56.101:8000/decks", deckData);
      }

      navigate(`/player/${user.id}`);
    } catch (error) {
      console.error("Error saving deck:", error);
    }
  };

  const handleImport = (cards: DeckCard[]) => {
    setSelectedCards((prev) => {
      const updatedCards = [...prev];
      const cardMap = new Map(updatedCards.map((card) => [card.id, card]));

      cards.forEach((newCard) => {
        const existingCard = cardMap.get(newCard.id);
        if (existingCard) {
          existingCard.quantity += newCard.quantity;
        } else {
          cardMap.set(newCard.id, newCard);
        }
      });

      return Array.from(cardMap.values());
    });
  };

  return (
    <div className="container py-4">
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando mazo...</span>
          </div>
        </div>
      ) : !user ? (
        <div className="alert alert-danger">
          Debe iniciar sesión para acceder a esta página.
        </div>
      ) : !deckId && isEditing ? (
        <div className="alert alert-danger">
          No se encontró el mazo especificado.
        </div>
      ) : (
        <>
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h1 className="display-5 mb-3">
                <i className="ms ms-deck ms-2x ms-cost ms-shadow me-3"></i>
                {isEditing ? "Editar Mazo" : "Nuevo Mazo"}
              </h1>
            </div>
          </div>

          <div className="row">
            <div className="col-12 mb-4">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-dark text-white">
                  <h3 className="h5 mb-0 d-flex justify-content-between align-items-center">
                    <span>
                      <i className="ms ms-planeswalker ms-1x ms-cost ms-shadow me-2"></i>
                      Información del Mazo
                    </span>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowSearchModal(true)}
                    >
                      <i className="ms ms-ability ms-1x ms-cost ms-shadow me-2"></i>
                      Agregar Cartas
                    </button>
                  </h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-4">
                        <ImportDeckList onImport={handleImport} />
                        <div className="mb-3">
                          <label className="form-label">Nombre del Mazo</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.deckName}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                deckName: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Formato</label>
                          <select
                            className="form-select"
                            value={formData.format}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                format: e.target.value,
                              }))
                            }
                            required
                          >
                            <option value="">Seleccionar formato</option>
                            <option value="Standard">Standard</option>
                            <option value="Modern">Modern</option>
                            <option value="Commander">Commander</option>
                            <option value="Pioneer">Pioneer</option>
                            <option value="Legacy">Legacy</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Descripción</label>
                          <textarea
                            className="form-control"
                            rows={3}
                            value={formData.deckDescription}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                deckDescription: e.target.value,
                              }))
                            }
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          className="btn btn-primary w-100"
                          disabled={selectedCards.length === 0}
                        >
                          {isEditing ? "Guardar Cambios" : "Crear Mazo"}
                        </button>
                      </div>
                      <div className="col-md-8">
                        <div className="card shadow-sm border-0">
                          <div className="card-header bg-dark text-white">
                            <h3 className="h5 mb-0">
                              <i className="ms ms-multiverse ms-1x ms-cost ms-shadow me-2"></i>
                              {`Cartas en el Mazo (${selectedCards.length})`}
                            </h3>
                          </div>
                          <div className="card-body">
                            {selectedCards.length === 0 ? (
                              <div className="alert alert-info mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                No hay cartas seleccionadas
                              </div>
                            ) : (
                              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                                {selectedCards.map((card) => (
                                  <div key={card.id} className="col">
                                    <div className="card h-100 border-0 shadow-sm">
                                      <img
                                        src={card.image.replace(
                                          "/small/",
                                          "/normal/"
                                        )}
                                        className="card-img-top"
                                        alt={card.name}
                                      />
                                      <div className="card-body">
                                        <h6 className="card-title mb-2">
                                          {card.name}
                                        </h6>
                                        <div className="d-flex justify-content-between align-items-center">
                                          <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={card.quantity}
                                            onChange={(e) =>
                                              updateCardQuantity(
                                                card.id,
                                                parseInt(e.target.value)
                                              )
                                            }
                                            min="1"
                                            style={{ width: "70px" }}
                                          />
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => removeCard(card.id)}
                                          >
                                            <i className="bi bi-trash"></i>
                                          </button>
                                        </div>
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
                  </form>
                </div>
              </div>
            </div>
          </div>

          <CardSearchModal
            show={showSearchModal}
            onHide={() => setShowSearchModal(false)}
            onAddCard={(card) => {
              addCard(card);
              setShowSearchModal(false);
            }}
          />
        </>
      )}
    </div>
  );
}

export default CreateDeckPage;
