import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  LogOut, CalendarPlus, CalendarClock, User, Bell,
  CheckCircle, Clock, XCircle, Stethoscope, Menu, X, Palette,
  CalendarDays, Printer
} from "lucide-react";
import { usarTema } from "../context/TemaContext";
import { FONDOS_PORTAL } from "../data/datosClinica";
import { traducirEspecialidad } from "../utils/traducciones";

const API_URL = import.meta.env.VITE_API_URL;


const ESTADO_CONFIG = {
  pendiente: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icono: <Clock size={14} />,
    etiqueta: "Pendiente",
  },
  confirmada: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    icono: <CheckCircle size={14} />,
    etiqueta: "Confirmada",
  },
  cancelada: {
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    icono: <XCircle size={14} />,
    etiqueta: "Cancelada",
  },
};

function exportarCitaPdf(cita, sesion) {
  const estado = (cita.status || "pendiente").toUpperCase();
  const especialidad = traducirEspecialidad(cita.specialty) || "Consulta médica";
  const nombrePaciente = `${sesion?.first_name || "Paciente"} ${sesion?.last_name || ""}`.trim();
  const documento = sesion?.document_number || "—";
  const fecha = cita.scheduled_date || "—";
  let hora = "—";
  if (cita.scheduled_time) {
  const [h, m] = cita.scheduled_time.split(":");
  const horas24 = parseInt(h, 10);
  const ampm = horas24 >= 12 ? "P.M." : "A.M.";
  const horas12 = horas24 % 12 || 12;
  hora = `${String(horas12).padStart(2, "0")}:${m} ${ampm}`;
}
  const motivo = cita.reason || "Sin observaciones";
  const codigo = `VAL-${cita.id || "000"}`;

  const contenido = `
    <html>
      <head>
        <title>Boleta de cita - ValSync</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #f8fafc; }
          .boleta { max-width: 760px; margin: 0 auto; background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(15,23,42,.12); }
          .encabezado { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 24px 28px; }
          .encabezado h1 { margin: 0 0 6px; font-size: 22px; }
          .encabezado p { margin: 0; opacity: 0.92; }
          .contenido { padding: 24px 28px 28px; }
          .fila { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .fila:last-child { border-bottom: none; }
          .etiqueta { color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
          .valor { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 4px; }
          .estado { display: inline-block; padding: 7px 12px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 12px; margin-bottom: 14px; }
          .nota { margin-top: 18px; padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; color: #475569; font-size: 13px; }
          .footer { margin-top: 22px; font-size: 12px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="boleta">
          <div class="encabezado">
            <h1>ValSync · Comprobante de cita</h1>
            <p>Portal del paciente · Atención médica programada</p>
          </div>
          <div class="contenido">
            <div class="estado">${estado}</div>
            <div class="fila"><div><div class="etiqueta">Código</div><div class="valor">${codigo}</div></div><div><div class="etiqueta">Fecha</div><div class="valor">${fecha}</div></div></div>
            <div class="fila"><div><div class="etiqueta">Paciente</div><div class="valor">${nombrePaciente}</div></div><div><div class="etiqueta">DNI</div><div class="valor">${documento}</div></div></div>
            <div class="fila"><div><div class="etiqueta">Especialidad</div><div class="valor">${especialidad}</div></div><div><div class="etiqueta">Médico</div><div class="valor">${cita.doctor || "Por asignar"}</div></div></div>
            <div class="fila"><div><div class="etiqueta">Hora</div><div class="valor">${hora}</div></div><div><div class="etiqueta">Registro</div><div class="valor">${cita.created_at ? new Date(cita.created_at).toLocaleDateString("es-PE") : "—"}</div></div></div>
            <div class="nota"><strong>Motivo:</strong> ${motivo}</div>
            <div class="footer">Gracias por confiar en ValSync. Presente este comprobante en su próxima visita.</div>
          </div>
        </div>
      </body>
    </html>
  `;

  const ventana = window.open("", "_blank", "width=900", "height=900");
  if (!ventana) return;
  ventana.document.write(contenido);
  ventana.document.close();
  ventana.focus();
  setTimeout(() => {
    ventana.print();
    ventana.close();
  }, 400);
}

export default function PortalPage({ sesion, onCerrarSesion, onNuevaCita, children }) {
  const [fondoActual, setFondoActual] = useState("default");
  const [palettAbierta, setPaletteAbierta] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("citas");
  const [vistaAgenda, setVistaAgenda] = useState("lista");
  const [notificacionesAbierta, setNotificacionesAbierta] = useState(false);
  const [misCitas, setMisCitas] = useState([]);
  const [cargandoCitas, setCargandoCitas] = useState(true);

  const { modoOscuro, alternarTema } = usarTema();

  // Cargar preferencia estética de fondo local
  useEffect(() => {
    const f = localStorage.getItem("valcare_fondo_portal");
    if (f) setFondoActual(f);
  }, []);

  const obtenerCitas = useCallback(async () => {
    if (!sesion?.id) return;
    try {
      setCargandoCitas(true);
      const token = localStorage.getItem("valcare_token");
      const respuesta = await fetch(`${API_URL}/valcare/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (respuesta.ok) {
        const data = await respuesta.json();
        setMisCitas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error cargando las citas del servidor:", error);
    } finally {
      setCargandoCitas(false);
    }
  }, [sesion?.id]);

  // Fetch asíncrono inicial
  useEffect(() => {
    obtenerCitas();
  }, [obtenerCitas]);

  const citasPendientes = misCitas.filter((c) => c.status === "pendiente").length;
  const citasConfirmadas = misCitas.filter((c) => c.status === "confirmada").length;
  const fondoClase = FONDOS_PORTAL.find((f) => f.id === fondoActual)?.clase || "";

  const citasAgrupadas = useMemo(() => {
    return misCitas.reduce((acc, cita) => {
      const key = cita.scheduled_date || "sin-fecha";
      if (!acc[key]) acc[key] = [];
      acc[key].push(cita);
      return acc;
    }, {});
  }, [misCitas]);

  const fechasAgenda = useMemo(() => Object.keys(citasAgrupadas).sort(), [citasAgrupadas]);

  const formatearFechaAgenda = (fecha) => {
    if (!fecha || fecha === "sin-fecha") return "Sin fecha";
    return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-PE", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const cambiarFondo = (id) => {
    setFondoActual(id);
    localStorage.setItem("valcare_fondo_portal", id);
    setPaletteAbierta(false);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("valcare_sesion");
    localStorage.removeItem("valcare_token");
    onCerrarSesion();
  };

  const childrenConFetch = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onCitaCreada: obtenerCitas });
    }
    return child;
  });

  return (
    <div className={`min-h-screen w-full flex flex-col ${
      modoOscuro ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"
    }`}>

      {/* Header */}
      <header className={`sticky top-0 z-40 border-b ${
        modoOscuro ? "bg-slate-800/90 backdrop-blur-xl border-slate-700/50" : "bg-white/90 backdrop-blur-xl border-slate-200/50"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-black bg-blue-600 text-white">
              <Stethoscope size={20} />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold">
                Val<span className={modoOscuro ? "text-blue-400" : "text-blue-600"}>Sync</span>
              </div>
              <div className={`text-xs hidden sm:block ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
                Portal del Paciente
              </div>
            </div>
          </div>

          {/* Controles Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setPaletteAbierta((v) => !v)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                  modoOscuro ? "hover:bg-slate-700/70 text-slate-300" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <Palette size={18} />
              </button>

              {palettAbierta && (
                <div className={`absolute right-0 top-11 w-56 rounded-xl shadow-xl border overflow-hidden z-10 ${
                  modoOscuro ? "bg-slate-800 border-slate-700/50" : "bg-white border-slate-200"
                }`}>
                  <div className={`px-4 py-3 border-b ${modoOscuro ? "border-slate-700/50" : "border-slate-100"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
                      Fondo del portal
                    </p>
                  </div>
                  {FONDOS_PORTAL.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => cambiarFondo(f.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                        fondoActual === f.id
                          ? modoOscuro ? "bg-slate-700/50 text-blue-400 font-semibold" : "bg-slate-50 text-blue-600 font-semibold"
                          : modoOscuro ? "text-slate-300 hover:bg-slate-700/30" : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${f.clase} border ${modoOscuro ? "border-slate-600" : "border-slate-300"}`} />
                      {f.nombre}
                      {fondoActual === f.id && <CheckCircle size={14} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={alternarTema}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                modoOscuro ? "hover:bg-slate-700/70 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              {modoOscuro ? "🌙" : "☀️"}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotificacionesAbierta((v) => !v)}
                className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition-all hover:scale-105 ${
                  modoOscuro ? "hover:bg-slate-700/70 text-slate-300" : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <Bell size={18} />
                {citasPendientes > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {citasPendientes}
                  </span>
                )}
              </button>

              {notificacionesAbierta && (
                <div className={`absolute right-0 top-11 w-72 rounded-xl shadow-xl border overflow-hidden z-20 ${
                  modoOscuro ? "bg-slate-800 border-slate-700/50" : "bg-white border-slate-200"
                }`}>
                  <div className={`px-4 py-3 border-b ${modoOscuro ? "border-slate-700/50" : "border-slate-100"}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
                      Notificaciones
                    </p>
                  </div>
                  <div className="p-3 space-y-2">
                    {citasPendientes > 0 ? (
                      <div className={`rounded-lg p-3 text-sm ${modoOscuro ? "bg-slate-700/50 text-slate-200" : "bg-slate-50 text-slate-700"}`}>
                        Tienes <span className="font-semibold text-blue-600">{citasPendientes}</span> cita{citasPendientes > 1 ? "s" : ""} pendiente{citasPendientes > 1 ? "s" : ""} por confirmar.
                      </div>
                    ) : (
                      <div className={`rounded-lg p-3 text-sm ${modoOscuro ? "text-slate-400" : "text-slate-600"}`}>
                        No tienes nuevas notificaciones en este momento.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleCerrarSesion}
              className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                modoOscuro ? "bg-red-600/20 text-red-400 hover:bg-red-600/30" : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>

          <button onClick={() => setMenuMovilAbierto(!menuMovilAbierto)} className="md:hidden">
            {menuMovilAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Menú Móvil */}
      {menuMovilAbierto && (
        <div className={`md:hidden border-b ${modoOscuro ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={alternarTema}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                modoOscuro ? "hover:bg-slate-700/50" : "hover:bg-slate-100"
              }`}
            >
              {modoOscuro ? "🌙 Modo oscuro" : "☀️ Modo claro"}
            </button>
            <button
              onClick={handleCerrarSesion}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-red-500 ${
                modoOscuro ? "hover:bg-red-600/20" : "hover:bg-red-50"
              }`}
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className={`flex-1 ${fondoClase}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Tarjeta de Bienvenida */}
          <div className={`rounded-2xl p-6 sm:p-8 mb-8 ${
            modoOscuro ? "bg-gradient-to-r from-blue-900/40 to-slate-800/40 border border-blue-800/30" : "bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 bg-blue-600 text-white">
                  {sesion.first_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className={`font-display font-bold text-2xl ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                    Hola, {sesion.first_name} 👋
                  </h1>
                  <p className={`text-sm mt-1 ${modoOscuro ? "text-slate-400" : "text-slate-600"}`}>
                    {sesion.email}
                  </p>
                </div>
              </div>
              <button
                onClick={onNuevaCita}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30"
              >
                <CalendarPlus size={18} />
                Nueva Cita
              </button>
            </div>

            {/* Métricas en tiempo real */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <StatCard valor={misCitas.length} etiqueta="Total de Citas" modoOscuro={modoOscuro} />
              <StatCard valor={citasPendientes} etiqueta="Pendientes" color="text-amber-500" modoOscuro={modoOscuro} />
              <StatCard valor={citasConfirmadas} etiqueta="Confirmadas" color="text-emerald-500" modoOscuro={modoOscuro} />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className={`rounded-2xl px-4 py-3 border ${modoOscuro ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}>
              <div className={`text-xs font-bold uppercase tracking-[0.2em] ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
                Vista de agenda
              </div>
              <div className={`text-sm font-semibold ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                Mantén tus consultas ordenadas y listas para imprimir.
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setVistaAgenda("lista")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  vistaAgenda === "lista"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : modoOscuro ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setVistaAgenda("calendario")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  vistaAgenda === "calendario"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : modoOscuro ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <CalendarDays size={16} />
                Calendario
              </button>
            </div>
          </div>

          {/* Selector de Secciones (Tabs) */}
          <div className={`flex gap-2 mb-8 border-b ${modoOscuro ? "border-slate-700/50" : "border-slate-200"}`}>
            {[
              { id: "citas", etiqueta: "Mis Citas", icono: <CalendarClock size={16} /> },
              { id: "perfil", etiqueta: "Mi Perfil", icono: <User size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSeccionActiva(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                  seccionActiva === tab.id
                    ? modoOscuro ? "border-blue-500 text-blue-400" : "border-blue-600 text-blue-600"
                    : modoOscuro ? "border-transparent text-slate-400 hover:text-slate-300" : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.icono}
                {tab.etiqueta}
              </button>
            ))}
          </div>

          {/* Renderizado de Vistas */}
          <div className="space-y-6">
            {seccionActiva === "citas" && (
              <>
                {cargandoCitas ? (
                  <div className="text-center py-16 text-sm text-slate-500">Conectando con el servidor de ValSync...</div>
                ) : misCitas.length === 0 ? (
                  <div className={`text-center py-16 rounded-2xl ${modoOscuro ? "bg-slate-800/30 border border-slate-700/30" : "bg-slate-100/50 border border-slate-200"}`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${modoOscuro ? "bg-slate-700/50" : "bg-slate-200"}`}>
                      <CalendarClock size={32} className={modoOscuro ? "text-slate-500" : "text-slate-400"} />
                    </div>
                    <h3 className={`font-display font-bold text-lg mb-2 ${modoOscuro ? "text-slate-300" : "text-slate-600"}`}>
                      No tienes citas registradas
                    </h3>
                    <button onClick={onNuevaCita} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700">
                      <CalendarPlus size={16} /> Reservar ahora
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vistaAgenda === "calendario" ? (
                      <div className="grid gap-4 lg:grid-cols-2">
                        {fechasAgenda.map((fecha) => (
                          <div key={fecha} className={`rounded-3xl border p-6 ${modoOscuro ? "bg-slate-800/50 border-slate-700/50" : "bg-white border-slate-200"}`}>
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
                                  Agenda
                                </p>
                                <h3 className={`font-display font-bold text-lg ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                                  {formatearFechaAgenda(fecha)}
                                </h3>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-xs font-bold ${modoOscuro ? "bg-blue-900/40 text-blue-300" : "bg-blue-50 text-blue-700"}`}>
                                {(citasAgrupadas[fecha] || []).length} cita(s)
                              </span>
                            </div>

                            <div className="mt-4 space-y-3">
                              {(citasAgrupadas[fecha] || []).map((cita) => (
                                <div key={cita.id} className={`rounded-2xl border p-3 ${modoOscuro ? "border-slate-700/50 bg-slate-900/40" : "border-slate-200 bg-slate-50"}`}>
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <p className={`text-sm font-semibold ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                                        {traducirEspecialidad(cita.specialty) || "Consulta médica"}
                                      </p>
                                      <p className={`text-xs ${modoOscuro ? "text-slate-400" : "text-slate-600"}`}>
                                        {cita.doctor || "Médico por asignar"}
                                      </p>
                                    </div>
                                    <span className={`text-xs font-semibold ${modoOscuro ? "text-blue-300" : "text-blue-700"}`}>
                                      {cita.scheduled_time}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      misCitas.map((cita) => (
                        <TarjetaCita key={cita.id} cita={cita} sesion={sesion} modoOscuro={modoOscuro} />
                      ))
                    )}
                  </div>
                )}
              </>
            )}

            {seccionActiva === "perfil" && (
              <div className="space-y-4">
                <div className={`rounded-2xl p-6 ${modoOscuro ? "bg-slate-800/50 border border-slate-700/50" : "bg-white border border-slate-200"}`}>
                  <h3 className={`font-display font-bold text-lg mb-6 ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                    Información de la Cuenta
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InfoFila etiqueta="Nombres" valor={sesion.first_name} modoOscuro={modoOscuro} />
                    <InfoFila etiqueta="Apellidos" valor={sesion.last_name} modoOscuro={modoOscuro} />
                    <InfoFila etiqueta="Número de Documento (DNI)" valor={sesion.document_number} modoOscuro={modoOscuro} />
                    <InfoFila etiqueta="Correo Electrónico" valor={sesion.email} modoOscuro={modoOscuro} />
                    <InfoFila etiqueta="Género" valor={sesion.gender === "MALE" ? "Masculino" : "Femenino"} modoOscuro={modoOscuro} />
                    <InfoFila etiqueta="Código Identificador Paciente" valor={sesion.id} modoOscuro={modoOscuro} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 🛠️ Aquí inyectamos de manera dinámica la prop para refrescar */}
      {childrenConFetch}
    </div>
  );
}

/* ── Subcomponentes Auxiliares ── */
function TarjetaCita({ cita, sesion, modoOscuro }) {
  const config = ESTADO_CONFIG[cita.status] || ESTADO_CONFIG.pendiente;

  // Formateamos la hora a formato de 12 horas con A.M. / P.M.
  const horaFormateada = useMemo(() => {
    if (!cita.scheduled_time) return "—";
    
    try {
      // Maneja formatos "14:30" o "14:30:00"
      const [h, m] = cita.scheduled_time.split(":");
      const horas24 = parseInt(h, 10);
      const ampm = horas24 >= 12 ? "P.M." : "A.M.";
      const horas12 = horas24 % 12 || 12;
      
      return `${String(horas12).padStart(2, "0")}:${m} ${ampm}`;
    } catch (error) {
      return cita.scheduled_time; // Retorno de respaldo por si ocurre un imprevisto
    }
  }, [cita.scheduled_time]);

  return (
    <article className={`rounded-3xl border p-6 shadow-sm transition-all ${
      modoOscuro ? "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50" : "bg-white border-slate-200 hover:border-slate-300"
    }`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            modoOscuro ? "bg-blue-900/40 text-blue-400" : "bg-blue-50 text-blue-600"
          }`}>
            <Stethoscope size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className={`font-bold text-base ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                {traducirEspecialidad(cita.specialty) || "Consulta Médica"}
              </h4>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${config.color} ${config.bg}`}>
                {config.icono}
                {config.etiqueta}
              </span>
            </div>
            <p className={`text-sm mt-0.5 ${modoOscuro ? "text-slate-400" : "text-slate-600"}`}>
              {cita.doctor || "Médico por asignar"}
            </p>
            {cita.reason && (
              <p className={`text-xs mt-2 italic ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
                “{cita.reason}”
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={`mt-5 grid gap-3 md:grid-cols-3 rounded-2xl p-4 ${modoOscuro ? "bg-slate-900/40" : "bg-slate-50"}`}>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${modoOscuro ? "text-slate-500" : "text-slate-500"}`}>Fecha</p>
          <p className={`text-sm font-semibold ${modoOscuro ? "text-white" : "text-slate-900"}`}>{cita.scheduled_date}</p>
        </div>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${modoOscuro ? "text-slate-500" : "text-slate-500"}`}>Hora</p>
          {/* Mostramos la hora formateada de manera limpia */}
          <p className={`text-sm font-semibold ${modoOscuro ? "text-white" : "text-slate-900"}`}>{horaFormateada}</p>
        </div>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${modoOscuro ? "text-slate-500" : "text-slate-500"}`}>Registro</p>
          <p className={`text-sm font-semibold ${modoOscuro ? "text-white" : "text-slate-900"}`}>{cita.created_at ? new Date(cita.created_at).toLocaleDateString("es-PE") : "—"}</p>
        </div>
      </div>

      <div className={`mt-5 pt-4 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
        modoOscuro ? "border-slate-700/50 text-slate-500" : "border-slate-100 text-slate-500"
      }`}>
        <span className="font-mono text-[10px] opacity-70">ID: {cita.id}</span>
        <button
          onClick={() => exportarCitaPdf(cita, sesion)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 font-semibold transition-colors ${
            modoOscuro ? "bg-slate-700/60 text-blue-300 hover:bg-slate-700" : "bg-slate-100 text-blue-700 hover:bg-slate-200"
          }`}
        >
          <Printer size={14} /> Boleta PDF
        </button>
      </div>
    </article>
  );
}

function StatCard({ valor, etiqueta, color = "", modoOscuro }) {
  return (
    <div className={`rounded-lg p-4 text-center ${modoOscuro ? "bg-slate-800/50 border border-slate-700/30" : "bg-white border border-slate-200"}`}>
      <div className={`font-display font-bold text-2xl ${color || (modoOscuro ? "text-white" : "text-slate-900")}`}>
        {valor}
      </div>
      <div className={`text-xs mt-1 ${modoOscuro ? "text-slate-400" : "text-slate-600"}`}>
        {etiqueta}
      </div>
    </div>
  );
}

function InfoFila({ etiqueta, valor, modoOscuro }) {
  return (
    <div className="space-y-1">
      <div className={`text-xs font-bold uppercase tracking-wider ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
        {etiqueta}
      </div>
      <div className={`text-sm font-semibold ${modoOscuro ? "text-white" : "text-slate-900"}`}>
        {valor || "—"}
      </div>
    </div>
  );
}