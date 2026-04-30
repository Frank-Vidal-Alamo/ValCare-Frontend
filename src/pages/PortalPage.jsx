import { useState, useEffect, useCallback } from "react";
import {
  LogOut, CalendarPlus, FileText, CalendarClock, User, Bell,
  Settings, ChevronRight, Palette, CheckCircle, Clock, XCircle,
  Stethoscope, Menu, X, AlertCircle,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { usarTema } from "../context/TemaContext";
import { FONDOS_PORTAL } from "../data/datosClinica";

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

function exportarCitaTxt(cita, usuario) {
  const lineas = [
    "═══════════════════════════════════════════════",
    "        VALCARE — RESUMEN DE CITA MÉDICA",
    "═══════════════════════════════════════════════",
    `ID de Cita    : ${cita.id}`,
    `Fecha emisión : ${new Date(cita.fechaCreacion).toLocaleString("es-PE")}`,
    "───────────────────────────────────────────────",
    "DATOS DEL PACIENTE",
    `Nombre        : ${usuario.nombres}`,
    `Correo        : ${usuario.correo}`,
    "───────────────────────────────────────────────",
    "DATOS DE LA CITA",
    `Especialidad  : ${cita.especialidad}`,
    `Especialista  : ${cita.doctor}`,
    `Día           : ${cita.dia}`,
    `Hora          : ${cita.hora}`,
    `Motivo        : ${cita.motivo || "No especificado"}`,
    `Síntomas      : ${cita.sintomas || "No especificados"}`,
    `Estado        : ${(cita.estado || "pendiente").toUpperCase()}`,
    "═══════════════════════════════════════════════",
    "ValCare Clínica Médica | Lima, Perú",
    "contacto@valcare.pe | +51 (01) 456-7890",
    "═══════════════════════════════════════════════",
  ];

  const blob = new Blob([lineas.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `valcare-cita-${cita.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PortalPage({ sesion, onCerrarSesion, onNuevaCita, children }) {
  const [fondoActual, setFondoActual] = useState("default");
  const [palettAbierta, setPaletteAbierta] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("citas");
  const [todasCitas] = useLocalStorage("valcare_citas", []);
  const { modoOscuro, alternarTema } = usarTema();

  useEffect(() => {
    const f = localStorage.getItem("valcare_fondo_portal");
    if (f) setFondoActual(f);
  }, []);

  const misCitas = todasCitas
    .filter((c) => c.correo === sesion.correo)
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

  const citasPendientes = misCitas.filter((c) => c.estado === "pendiente").length;
  const fondoClase = FONDOS_PORTAL.find((f) => f.id === fondoActual)?.clase || "";

  const cambiarFondo = (id) => {
    setFondoActual(id);
    localStorage.setItem("valcare_fondo_portal", id);
    setPaletteAbierta(false);
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("valcare_sesion");
    onCerrarSesion();
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${
      modoOscuro
        ? "bg-slate-900 text-white"
        : "bg-slate-50 text-slate-900"
    }`}>

      {/* ── Barra superior ── */}
      <header className={`sticky top-0 z-40 border-b ${
        modoOscuro
          ? "bg-slate-800/90 backdrop-blur-xl border-slate-700/50"
          : "bg-white/90 backdrop-blur-xl border-slate-200/50"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black ${
              modoOscuro
                ? "bg-blue-600 text-white"
                : "bg-blue-600 text-white"
            }`}>
              <Stethoscope size={20} />
            </div>
            <div>
              <div className="font-display text-lg font-extrabold">
                Val<span className={modoOscuro ? "text-blue-400" : "text-blue-600"}>Care</span>
              </div>
              <div className={`text-xs hidden sm:block ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
                Portal del Paciente
              </div>
            </div>
          </div>

          {/* Controles en desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Selector de fondo */}
            <div className="relative">
              <button
                onClick={() => setPaletteAbierta((v) => !v)}
                aria-label="Cambiar fondo"
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                  modoOscuro
                    ? "hover:bg-slate-700/70 text-slate-300"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                <Palette size={18} />
              </button>

              {palettAbierta && (
                <div className={`absolute right-0 top-11 w-56 rounded-xl shadow-xl border overflow-hidden z-10 ${
                  modoOscuro
                    ? "bg-slate-800 border-slate-700/50"
                    : "bg-white border-slate-200"
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
                          ? modoOscuro
                            ? "bg-slate-700/50 text-blue-400 font-semibold"
                            : "bg-slate-50 text-blue-600 font-semibold"
                          : modoOscuro
                            ? "text-slate-300 hover:bg-slate-700/30"
                            : "text-slate-700 hover:bg-slate-50"
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

            {/* Toggle tema */}
            <button
              onClick={alternarTema}
              aria-label="Cambiar tema"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                modoOscuro
                  ? "hover:bg-slate-700/70 text-slate-300"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              {modoOscuro ? "🌙" : "☀️"}
            </button>

            {/* Notificaciones */}
            <button
              aria-label="Notificaciones"
              className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                modoOscuro
                  ? "hover:bg-slate-700/70 text-slate-300"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <Bell size={18} />
              {citasPendientes > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {citasPendientes}
                </span>
              )}
            </button>

            {/* Cerrar sesión */}
            <button
              onClick={handleCerrarSesion}
              aria-label="Cerrar sesión"
              className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
                modoOscuro
                  ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              <LogOut size={16} />
              Salir
            </button>
          </div>

          {/* Menú móvil */}
          <button
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="md:hidden"
          >
            {menuMovilAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* ── Menú móvil ── */}
      {menuMovilAbierto && (
        <div className={`md:hidden border-b ${modoOscuro ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-50 border-slate-200"}`}>
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={alternarTema}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                modoOscuro ? "hover:bg-slate-700/50" : "hover:bg-slate-100"
              }`}
            >
              {modoOscuro ? "🌙" : "☀️"} {modoOscuro ? "Modo oscuro" : "Modo claro"}
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

      {/* ── Contenido principal ── */}
      <main className={`flex-1 ${fondoClase}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Hero del perfil */}
          <div className={`rounded-2xl p-6 sm:p-8 mb-8 ${
            modoOscuro
              ? "bg-gradient-to-r from-blue-900/40 to-slate-800/40 border border-blue-800/30"
              : "bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-200"
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${
                  modoOscuro
                    ? "bg-blue-600 text-white"
                    : "bg-blue-600 text-white"
                }`}>
                  {sesion.nombres?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className={`font-display font-bold text-2xl ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                    Hola, {sesion.nombres?.split(" ")[0]} 👋
                  </h1>
                  <p className={`text-sm mt-1 ${modoOscuro ? "text-slate-400" : "text-slate-600"}`}>
                    {sesion.correo}
                  </p>
                </div>
              </div>
              <button
                onClick={onNuevaCita}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                  modoOscuro
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30"
                }`}
              >
                <CalendarPlus size={18} />
                Nueva Cita
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <StatCard
                valor={misCitas.length}
                etiqueta="Total de Citas"
                modoOscuro={modoOscuro}
              />
              <StatCard
                valor={citasPendientes}
                etiqueta="Pendientes"
                color="text-amber-500"
                modoOscuro={modoOscuro}
              />
              <StatCard
                valor={misCitas.filter((c) => c.estado === "confirmada").length}
                etiqueta="Confirmadas"
                color="text-emerald-500"
                modoOscuro={modoOscuro}
              />
            </div>
          </div>

          {/* Tabs */}
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
                    ? modoOscuro
                      ? "border-blue-500 text-blue-400"
                      : "border-blue-600 text-blue-600"
                    : modoOscuro
                      ? "border-transparent text-slate-400 hover:text-slate-300"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.icono}
                {tab.etiqueta}
              </button>
            ))}
          </div>

          {/* Contenido de secciones */}
          <div className="space-y-6">

            {/* ── SECCIÓN: MIS CITAS ── */}
            {seccionActiva === "citas" && (
              <>
                {misCitas.length === 0 ? (
                  <div className={`text-center py-16 rounded-2xl ${
                    modoOscuro
                      ? "bg-slate-800/30 border border-slate-700/30"
                      : "bg-slate-100/50 border border-slate-200"
                  }`}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                      modoOscuro ? "bg-slate-700/50" : "bg-slate-200"
                    }`}>
                      <CalendarClock size={32} className={modoOscuro ? "text-slate-500" : "text-slate-400"} />
                    </div>
                    <h3 className={`font-display font-bold text-lg mb-2 ${
                      modoOscuro ? "text-slate-300" : "text-slate-600"
                    }`}>
                      Sin citas registradas
                    </h3>
                    <p className={`text-sm mb-6 ${modoOscuro ? "text-slate-500" : "text-slate-500"}`}>
                      Agenda tu primera consulta con nuestros especialistas.
                    </p>
                    <button
                      onClick={onNuevaCita}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        modoOscuro
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      <CalendarPlus size={16} />
                      Reservar ahora
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {misCitas.map((cita) => (
                      <TarjetaCita
                        key={cita.id}
                        cita={cita}
                        sesion={sesion}
                        modoOscuro={modoOscuro}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── SECCIÓN: MI PERFIL ── */}
            {seccionActiva === "perfil" && (
              <div className="space-y-4">
                <div className={`rounded-2xl p-6 ${
                  modoOscuro
                    ? "bg-slate-800/50 border border-slate-700/50"
                    : "bg-white border border-slate-200"
                }`}>
                  <h3 className={`font-display font-bold text-lg mb-6 ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <InfoFila
                      etiqueta="Nombre completo"
                      valor={sesion.nombres}
                      modoOscuro={modoOscuro}
                    />
                    <InfoFila
                      etiqueta="Correo electrónico"
                      valor={sesion.correo}
                      modoOscuro={modoOscuro}
                    />
                    <InfoFila
                      etiqueta="ID de cuenta"
                      valor={sesion.id}
                      modoOscuro={modoOscuro}
                    />
                    <InfoFila
                      etiqueta="Miembro desde"
                      valor={
                        sesion.fechaRegistro
                          ? new Date(sesion.fechaRegistro).toLocaleDateString("es-PE", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"
                      }
                      modoOscuro={modoOscuro}
                    />
                  </div>
                </div>

                <button
                  onClick={handleCerrarSesion}
                  className={`w-full flex items-center justify-between p-5 rounded-xl transition-all ${
                    modoOscuro
                      ? "bg-red-900/20 border border-red-700/30 text-red-400 hover:bg-red-900/30"
                      : "bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    <div className="text-left">
                      <div className="font-semibold">Cerrar sesión</div>
                      <div className="text-xs opacity-70">Se eliminará la sesión activa</div>
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Modal del motor de citas */}
      {children}
    </div>
  );
}

/* ── Subcomponente: Tarjeta de cita ── */
function TarjetaCita({ cita, sesion, modoOscuro }) {
  const config = ESTADO_CONFIG[cita.estado] || ESTADO_CONFIG.pendiente;

  return (
    <div className={`rounded-2xl p-6 border ${
      modoOscuro
        ? "bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50"
        : "bg-white border-slate-200 hover:border-slate-300"
    } transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            modoOscuro
              ? "bg-blue-900/40 text-blue-400"
              : "bg-blue-50 text-blue-600"
          }`}>
            <Stethoscope size={22} />
          </div>
          <div>
            <h4 className={`font-bold text-base ${modoOscuro ? "text-white" : "text-slate-900"}`}>
              {cita.especialidad}
            </h4>
            <p className={`text-sm mt-0.5 ${modoOscuro ? "text-slate-400" : "text-slate-600"}`}>
              {cita.doctor}
            </p>
            <p className={`text-xs mt-1 ${modoOscuro ? "text-slate-500" : "text-slate-500"}`}>
              {cita.dia} · {cita.hora}
            </p>
            {cita.motivo && (
              <p className={`text-xs mt-2 italic ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
                "{cita.motivo}"
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${config.color} ${config.bg}`}>
            {config.icono}
            {config.etiqueta}
          </span>
          <button
            onClick={() => exportarCitaTxt(cita, sesion)}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              modoOscuro
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            <FileText size={14} />
            Exportar (.txt)
          </button>
        </div>
      </div>

      <div className={`mt-4 pt-4 border-t flex items-center justify-between text-xs ${
        modoOscuro ? "border-slate-700/50 text-slate-500" : "border-slate-100 text-slate-500"
      }`}>
        <span className="font-mono">{cita.id}</span>
        <span>{new Date(cita.fechaCreacion).toLocaleDateString("es-PE")}</span>
      </div>
    </div>
  );
}

/* ── Subcomponentes auxiliares ── */
function StatCard({ valor, etiqueta, color = "", modoOscuro }) {
  return (
    <div className={`rounded-lg p-4 text-center ${
      modoOscuro
        ? "bg-slate-800/50 border border-slate-700/30"
        : "bg-white border border-slate-200"
    }`}>
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
      <div className={`text-xs font-bold uppercase tracking-wider ${
        modoOscuro ? "text-slate-400" : "text-slate-500"
      }`}>
        {etiqueta}
      </div>
      <div className={`text-sm font-semibold ${modoOscuro ? "text-white" : "text-slate-900"}`}>
        {valor || "—"}
      </div>
    </div>
  );
}
