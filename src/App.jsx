import { useState, useEffect } from 'react'
import Encabezado from "./components/Encabezado";
import Hero from "./components/Hero";
import { PorQueElegirnos, Especialidades, StaffMedico, Contacto } from "./components/SeccionesCore";
import PieDePagina from "./components/PiedePagina";
import BotonagenCita from "./components/BotonagenCita";
import BookingEngine from "./components/BookingEngine";
import LoginPage from "./pages/LoginPage";
import PortalPage from "./pages/PortalPage";

export default function App() {
  const [sesion, setSesion] = useState(
      () => JSON.parse(localStorage.getItem("valcare_sesion") || "null")
    );
  
    const [pagina, setPagina] = useState(() => {
      const sesionExistente = JSON.parse(localStorage.getItem("valcare_sesion") || "null");
      return sesionExistente ? "portal" : "inicio";
    });
  
    const [authAbierto, setAuthAbierto] = useState(false);
    const [citaAbierta, setCitaAbierta] = useState(false);
    const [accionTrasAuth, setAccionTrasAuth] = useState(null);
    const [mensajeAuth, setMensajeAuth] = useState("");
  
    // Sincronizar sesión con página
    useEffect(() => {
      if (sesion && pagina === "inicio") {
        setPagina("portal");
      }
    }, [sesion, pagina]);
  
    // Reservar cita: requiere sesión
    const abrirReserva = () => {
    if (sesion) {
      setCitaAbierta(true);
    } else {
      setMensajeAuth("Para reservar una cita primero debes iniciar sesión.");
      setAccionTrasAuth(() => () => setCitaAbierta(true));
      setPagina("login"); // Redirección directa a LoginPage
    }
};
  
    // Abrir portal: requiere sesión
    const abrirPortal = () => {
      if (sesion) {
        setPagina("portal");
      } else {
        setPagina("login");
      }
    };
  
    // Ir a login
    const irAlLogin = () => {
      setPagina("login");
    };
  
    // Al autenticar exitosamente en login
    const onLoginExito = (usuario) => {
      setSesion(usuario);
      setPagina("portal");
    };
  
    // Al autenticar exitosamente en modal
    const onAuthExito = (usuario) => {
      setSesion(usuario);
      setAuthAbierto(false);
      accionTrasAuth?.();
      setAccionTrasAuth(null);
      setMensajeAuth("");
      if (pagina === "inicio") {
        setPagina("portal");
      }
    };
  
    // Cerrar sesión
    const cerrarSesion = () => {
      localStorage.removeItem("valcare_sesion");
      setSesion(null);
      setPagina("inicio");
    };
  
    // Volver desde portal
    const volverAlInicio = () => {
      setPagina("inicio");
    };
  
    /* ────────────────────── RENDERIZADO CONDICIONAL ────────────────────── */
  
    // PÁGINA: LOGIN
    if (pagina === "login") {
      return (
        <LoginPage onLoginExito={onLoginExito} />
      );
    }
  
    // PÁGINA: PORTAL DEL PACIENTE
    if (pagina === "portal" && sesion) {
      return (
        <PortalPage
          sesion={sesion}
          onCerrarSesion={cerrarSesion}
          onNuevaCita={() => setCitaAbierta(true)}
        >
          {/* Motor de citas como modal dentro del portal */}
          <BookingEngine
            abierto={citaAbierta}
            onCerrar={() => setCitaAbierta(false)}
            sesion={sesion}
            onRequiereAuth={() => {
              setMensajeAuth("Para reservar una cita primero debes iniciar sesión.");
              setAccionTrasAuth(() => () => setCitaAbierta(true));
              setAuthAbierto(true);
            }}
            onCitaCreada={() => setPagina("portal")}
          />
        </PortalPage>
      );
    }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] text-[var(--color-texto)] antialiased">
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
    
          {/* FAB flotante */}
          <BotonagenCita onClick={abrirReserva} />
    
          {/* Motor de citas */}
          <BookingEngine
            abierto={citaAbierta}
            onCerrar={() => setCitaAbierta(false)}
            sesion={sesion}
            onRequiereAuth={() => {
              setMensajeAuth("Para reservar una cita primero debes iniciar sesión.");
              setAccionTrasAuth(() => () => setCitaAbierta(true));
              setAuthAbierto(true);
            }}
            onCitaCreada={() => setPagina("portal")}
          />
        </div>
  );
}
