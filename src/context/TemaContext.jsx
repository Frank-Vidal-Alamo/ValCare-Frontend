import { createContext, useContext, useState, useEffect } from "react";

const TemaContexto = createContext(null);

export function ProveedorTema({ children }) {
  const [modoOscuro, setModoOscuro] = useState(() => {
    // 1. Preferencia guardada por el usuario
    const guardado = localStorage.getItem("valcare_tema");
    if (guardado !== null) return guardado === "oscuro";
    // 2. Preferencia del sistema operativo
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const raiz = window.document.documentElement;
    if (modoOscuro) {
      raiz.classList.add("dark");
      raiz.style.colorScheme = "dark";
    } else {
      raiz.classList.remove("dark");
    }
    localStorage.setItem("valcare_tema", modoOscuro ? "oscuro" : "claro");
  }, [modoOscuro]);

  const alternarTema = () => setModoOscuro((prev) => !prev);

  return (
    <TemaContexto.Provider value={{ modoOscuro, alternarTema }}>
      {children}
    </TemaContexto.Provider>
  );
}

export function usarTema() {
  const ctx = useContext(TemaContexto);
  if (!ctx) throw new Error("usarTema debe usarse dentro de <ProveedorTema>");
  return ctx;
}
