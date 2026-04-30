import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ProveedorTema } from "./context/TemaContext";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ProveedorTema>
      <App />
    </ProveedorTema>
  </StrictMode>
);
