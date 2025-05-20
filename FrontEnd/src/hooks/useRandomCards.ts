import { useState, useEffect } from "react";
import { CardData } from "../Types/Types";

export const useRandomCards = () => {
  const [randomCards, setRandomCards] = useState<CardData[]>([]);

  useEffect(() => {
    const fetchRandomCards = async () => {
      try {
        const response = await fetch(
          "https://api.scryfall.com/cards/random?q=is:commander"
        );
        const data = await response.json();
        setRandomCards((prevCards) => {
          if (prevCards.length >= 3) {
            return [...prevCards.slice(1), data];
          }
          return [...prevCards, data];
        });
      } catch (error) {
        console.error("Error fetching random card:", error);
      }
    };

    const interval = setInterval(fetchRandomCards, 8000);
    fetchRandomCards(); // Carga inicial

    return () => clearInterval(interval);
  }, []);

  return { randomCards };
};

export default useRandomCards;
