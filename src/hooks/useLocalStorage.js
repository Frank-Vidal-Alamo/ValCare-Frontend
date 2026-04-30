import { useState } from "react";

export function useLocalStorage(clave, valorInicial) {
  const [valorAlmacenado, setValorAlmacenado] = useState(() => {
    try {
      const item = localStorage.getItem(clave);
      return item !== null ? JSON.parse(item) : valorInicial;
    } catch (error) {
      console.warn(`[ValCare] Error al leer LocalStorage (${clave}):`, error);
      return valorInicial;
    }
  });

  const guardar = (valor) => {
    try {
      // Acepta función actualizadora igual que setState
      const valorAGuardar =
        valor instanceof Function ? valor(valorAlmacenado) : valor;
      setValorAlmacenado(valorAGuardar);
      localStorage.setItem(clave, JSON.stringify(valorAGuardar));
    } catch (error) {
      console.warn(`[ValCare] Error al escribir LocalStorage (${clave}):`, error);
    }
  };

  const eliminar = () => {
    localStorage.removeItem(clave);
    setValorAlmacenado(valorInicial);
  };

  return [valorAlmacenado, guardar, eliminar];
}
