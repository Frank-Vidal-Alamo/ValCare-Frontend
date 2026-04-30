import { useState, useEffect } from 'react'
import Encabezado from "./components/Encabezado";
import Hero from "./components/Hero";
import { PorQueElegirnos, Especialidades, StaffMedico, Contacto } from "./components/SeccionesCore";
// Importamos los que faltaban para que no den error
import PieDePagina from "./components/PiedePagina";
import BotonagenCita from "./components/BotonagenCita";

export default function App() {
  // 1. Estado de sesión (se mantiene para no romper el Encabezado)
  const [sesion, setSesion] = useState(
    () => JSON.parse(localStorage.getItem("valcare_sesion") || "null")
  );

  // 2. Funciones estáticas (Placeholder)
  // Las definimos para que cuando los componentes las llamen, no lancen "is not defined"
  const abrirReserva = () => {
    console.log("Funcionalidad de reserva en desarrollo...");
    alert("Próximamente: Motor de reservas ValCare");
  };

  const abrirPortal = () => {
    alert("Próximamente: Portal del Paciente");
  };

  const irAlLogin = () => {
    alert("Próximamente: Página de Login");
  };

  const cerrarSesion = () => {
    localStorage.removeItem("valcare_sesion");
    setSesion(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] text-[var(--color-texto)] antialiased">
      {/* Pasamos las funciones a los componentes para que los botones funcionen sin fallar */}
      <Encabezado
        sesion={sesion}
        onAbrirPortal={abrirPortal}
        onCerrarSesion={cerrarSesion}
        onIrAlLogin={irAlLogin}
      />

      <main className="pt-20">
        <Hero onAbrirCita={abrirReserva} />
        <PorQueElegirnos />
        <Especialidades />
        <StaffMedico onAbrirCita={abrirReserva} />
        <Contacto />
      </main>

      <PieDePagina />

      {/* FAB flotante estático por ahora */}
      <BotonagenCita onClick={abrirReserva} />
    </div>
  );
}
