import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";
import "mana-font/css/mana.css";
import "./index.css";

const initializeBootstrap = () => {
  // Initialize all dropdowns
  const dropdownElements = document.querySelectorAll(".dropdown-toggle");
  dropdownElements.forEach((element) => {
    new bootstrap.Dropdown(element);
  });
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Initialize Bootstrap after React renders
window.addEventListener("load", initializeBootstrap);
