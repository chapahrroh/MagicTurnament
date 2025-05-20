import { Deck } from "../Types/Types";
import { CardData as CardDetails } from "../Types/Types";

interface DeckViewModalProps {
  show: boolean;
  onHide: () => void;
  deck: Deck | null;
}
import { useEffect, useState } from "react";
import { fetchCardDetails } from "../api/apiRequests";

function DeckViewModal({ show, onHide, deck }: DeckViewModalProps) {
  const [cardDetails, setCardDetails] = useState<Map<string, CardDetails>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<{
    image: string;
    x: number;
    y: number;
  } | null>(null);

  const getCardsDetails = async (deck: Deck) => {
    setIsLoading(true);
    try {
      const { cardDetails: details, error: cardDetailError } =
        await fetchCardDetails(deck);

      if (cardDetailError) {
        console.error("Error fetching card details:", cardDetailError);
        alert(
          "Error al cargar los detalles de las cartas. Por favor, intente nuevamente."
        );
        return;
      }
      setCardDetails(details);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("Error inesperado al cargar los detalles de las cartas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (show && deck) {
      getCardsDetails(deck);
    }
  }, [show, deck]);

  const handleMouseMove = (e: React.MouseEvent, imageUrl: string) => {
    const x = e.clientX;
    const y = e.clientY;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const imageWidth = 330;
    const imageHeight = 460;

    let posX = x + 20;
    let posY = y + 20;

    if (posX + imageWidth > windowWidth) {
      posX = x - imageWidth - 20;
    }
    if (posY + imageHeight > windowHeight) {
      posY = y - imageHeight - 20;
    }

    setHoveredCard({ image: imageUrl, x: posX, y: posY });
  };

  if (!deck) return null;

  const cardList = deck.deckList
    .split("\n")
    .map((line) => {
      const [quantity, id] = line.trim().split(" ");
      return { quantity: parseInt(quantity), id };
    })
    .filter((card) => card.id);

  const getCardTypeIcon = (type_line: string) => {
    if (type_line.includes("Creature")) return "ms ms-creature";
    if (type_line.includes("Instant")) return "ms ms-instant";
    if (type_line.includes("Sorcery")) return "ms ms-sorcery";
    if (type_line.includes("Enchantment")) return "ms ms-enchantment";
    if (type_line.includes("Artifact")) return "ms ms-artifact";
    if (type_line.includes("Land")) return "ms ms-land";
    if (type_line.includes("Planeswalker")) return "ms ms-planeswalker";
    return "ms ms-ability";
  };

  return (
    <>
      <div className={`modal ${show ? "show d-block" : ""}`} tabIndex={-1}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">
                <i className="ms ms-deck ms-1x ms-cost ms-shadow me-2"></i>
                {deck.deckName}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-hover">
                    <thead>
                      <tr>
                        <th>Cantidad</th>
                        <th>Carta</th>
                        <th>Coste</th>
                        <th>Tipo</th>
                        <th>Rareza</th>
                        <th>Set</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cardList.map(({ quantity, id }) => {
                        const details = cardDetails.get(id);
                        if (!details) return null;
                        const imageUrl =
                          details.image_uris?.normal ||
                          details.card_faces?.[0].image_uris.normal;

                        return (
                          <tr key={id} className="align-middle">
                            <td>{quantity}x</td>
                            <td>
                              <div
                                className="d-flex align-items-center gap-2 card-name-hover"
                                onMouseMove={(e) =>
                                  handleMouseMove(e, imageUrl || "")
                                }
                                onMouseLeave={() => setHoveredCard(null)}
                              >
                                <img
                                  src={
                                    details.image_uris?.small ||
                                    details.card_faces?.[0].image_uris.small
                                  }
                                  alt={details.name}
                                  style={{ width: "30px", height: "auto" }}
                                  className="rounded"
                                />
                                {details.name}
                              </div>
                            </td>
                            <td>
                              {(
                                details.mana_cost ||
                                (details.card_faces?.[0] &&
                                "mana_cost" in details.card_faces[0]
                                  ? (details.card_faces[0] as any).mana_cost
                                  : "") ||
                                ""
                              )
                                .match(/\{(.+?)\}/g)
                                ?.map((symbol: string, index: number) => (
                                  <i
                                    key={index}
                                    className={`ms ms-${symbol
                                      .replace(/[{}]/g, "")
                                      .toLowerCase()} ms-cost ms-shadow`}
                                  ></i>
                                ))}
                            </td>
                            <td>
                              <i
                                className={`${getCardTypeIcon(
                                  details.type_line
                                )} ms-1x ms-cost ms-shadow me-2`}
                              ></i>
                              {details.type_line}
                            </td>
                            <td>
                              <i
                                className={`ms ms-${details.rarity.toLowerCase()} ms-1x ms-cost ms-shadow me-2`}
                              ></i>
                              {details.rarity}
                            </td>
                            <td>{details.set_name}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {hoveredCard && (
        <img
          src={hoveredCard.image}
          alt="Card preview"
          className="card-hover-preview"
          style={{
            position: "fixed",
            left: hoveredCard.x,
            top: hoveredCard.y,
            maxHeight: "460px",
            opacity: 1,
          }}
        />
      )}
    </>
  );
}

export default DeckViewModal;
