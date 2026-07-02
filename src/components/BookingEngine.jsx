import { useState, useEffect, useCallback } from "react";
import { traducirEspecialidad } from "../utils/traducciones";
import {
  X, ChevronRight, Star, Clock, CheckCircle,
  CalendarCheck, Loader2, User, ArrowLeft, Search,
} from "lucide-react";

const API_URL = import.meta.env?.VITE_API_URL || "";

const PASO = { ESPECIALIDAD: 1, DOCTOR: 2, HORARIO: 3, MOTIVO: 4, CONFIRMACION: 5 };

const ESTADO_INICIAL = {
  especialidadId: "",
  doctorId:       "",
  dia:            "",
  franja:         "",
  motivo:         "",
  sintomas:       "",
};

export default function BookingEngine({ abierto, onCerrar, sesion, onRequiereAuth, onCitaCreada }) {
  const [paso,      setPaso]      = useState(PASO.ESPECIALIDAD);
  const [seleccion, setSeleccion] = useState(ESTADO_INICIAL);
  const [cargando,  setCargando]  = useState(false);
  const [exito,     setExito]     = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [errorReserva, setErrorReserva] = useState("");
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState("");
  const [busquedaDoctor, setBusquedaDoctor] = useState("");

  /* ── Verificar autenticación al abrir ── */
  useEffect(() => {
    if (abierto && !sesion) {
      onRequiereAuth?.();
      onCerrar();
    }
  }, [abierto, sesion, onRequiereAuth, onCerrar]);

  /* ── Cerrar con Escape ── */
  const cerrarEscape = useCallback((e) => {
    if (e.key === "Escape") onCerrar();
  }, [onCerrar]);

  useEffect(() => {
    if (abierto) {
      document.addEventListener("keydown", cerrarEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", cerrarEscape);
      document.body.style.overflow = "";
    };
  }, [abierto, cerrarEscape]);

  useEffect(() => {
    if (!abierto || !sesion) return;

    const cargarEspecialidades = async () => {
      try {
        setCargandoDatos(true);
        const token = localStorage.getItem("valcare_token");
        const respuesta = await fetch(`${API_URL}/valcare/specialties`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!respuesta.ok) throw new Error("No fue posible cargar las especialidades.");

        const data = await respuesta.json();
        setEspecialidades(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorReserva(error.message);
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarEspecialidades();
  }, [abierto, sesion?.id]);

  useEffect(() => {
    if (!abierto || !sesion || !seleccion.especialidadId) {
      setDoctores([]);
      return;
    }

    const cargarDoctores = async () => {
      try {
        const token = localStorage.getItem("valcare_token");
        const respuesta = await fetch(`${API_URL}/valcare/doctors?specialty_id=${seleccion.especialidadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!respuesta.ok) throw new Error("No fue posible cargar los doctores.");

        const data = await respuesta.json();
        setDoctores(Array.isArray(data) ? data : []);
      } catch (error) {
        setErrorReserva(error.message);
      }
    };

    cargarDoctores();
  }, [abierto, sesion?.id, seleccion.especialidadId]);

    // ── Cargar Horarios Disponibles desde la API ──
  useEffect(() => {
    if (!abierto || !sesion || !seleccion.doctorId || !seleccion.dia) {
      setHorariosDisponibles([]);
      return;
    }

    const cargarHorariosDelDoctor = async () => {
      try {
        setCargandoHorarios(true);
        const token = localStorage.getItem("valcare_token");
        
        // 🚨 OJO: Si tu backend filtra por el ID de perfil, asegúrate de que tu endpoint 
        // de FastAPI resuelva internamente si recibe el staff_id, o pásale el ID correcto.
        const respuesta = await fetch(
          `${API_URL}/valcare/schedules?doctor_id=${seleccion.doctorId}&date=${seleccion.dia}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!respuesta.ok) throw new Error("No se pudieron obtener los horarios.");

        const data = await respuesta.json();
        // Asumiendo que tu backend devuelve una lista de objetos con el campo .scheduled_time o un array de strings
        // Ejemplo de formateo si devuelve objetos: data.map(h => h.scheduled_time.slice(0, 5))
        setHorariosDisponibles(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al traer horarios:", error);
      } finally {
        setCargandoHorarios(false);
      }
    };

    cargarHorariosDelDoctor();
  }, [abierto, sesion?.id, seleccion.doctorId, seleccion.dia]); // Se dispara al cambiar doctor o día

  if (!abierto || !sesion) return null;

  const doctorSeleccionado = doctores.find((d) => d.id === seleccion.doctorId);
  const espSeleccionada = especialidades.find((e) => e.id === seleccion.especialidadId);
  const especialidadesFiltradas = especialidades.filter((esp) => {
    const texto = busquedaEspecialidad.toLowerCase().trim();
    if (!texto) return true;
    return esp.name?.toLowerCase().includes(texto) || esp.description?.toLowerCase().includes(texto);
  });

  const doctoresFiltrados = doctores.filter((doc) => {
    const texto = busquedaDoctor.toLowerCase().trim();
    if (!texto) return true;
    return doc.full_name?.toLowerCase().includes(texto) || doc.specialty_name?.toLowerCase().includes(texto);
  });

  const diasUnicos = Array.from({ length: 5 }, (_, index) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + index);
    return {
      value: fecha.toISOString().slice(0, 10),
      label: fecha.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "short" }),
    };
  });


  /* ── Navegación entre pasos ── */
  const seleccionar = (campo, valor) => {
    setSeleccion((p) => ({ ...p, [campo]: valor }));
    // Avance automático
    if (campo === "especialidadId") setPaso(PASO.DOCTOR);
    if (campo === "doctorId")       setPaso(PASO.HORARIO);
    if (campo === "franja")         setPaso(PASO.MOTIVO);
  };

  const retroceder = () => {
    if (paso === PASO.DOCTOR)        { setPaso(PASO.ESPECIALIDAD); setSeleccion((p) => ({ ...p, doctorId: "", dia: "", franja: "" })); }
    else if (paso === PASO.HORARIO)  { setPaso(PASO.DOCTOR);       setSeleccion((p) => ({ ...p, dia: "", franja: "" })); }
    else if (paso === PASO.MOTIVO)   { setPaso(PASO.HORARIO);      setSeleccion((p) => ({ ...p, franja: "" })); }
    else if (paso === PASO.CONFIRMACION) setPaso(PASO.MOTIVO);
  };

  /* ── Confirmar cita ── */
  const confirmar = async () => {
    setCargando(true);
    setErrorReserva("");

    try {
      const token = localStorage.getItem("valcare_token");
      const respuesta = await fetch(`${API_URL}/valcare/book-appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          scheduled_date: seleccion.dia,
          scheduled_time: `${seleccion.franja}:00`,
          doctor_id: seleccion.doctorId,
          reason: seleccion.motivo.trim(),
        }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.detail || "No fue posible reservar la cita.");
      }

      setCargando(false);
      setExito(true);
      onCitaCreada?.();
    } catch (error) {
      setCargando(false);
      setErrorReserva(error.message);
    }
  };

  const cerrarYReiniciar = () => {
    setExito(false);
    setErrorReserva("");
    setSeleccion(ESTADO_INICIAL);
    setPaso(PASO.ESPECIALIDAD);
    onCerrar();
  };

  /* ══════════════ RENDER ══════════════ */
  return (
    <div
      className="fixed inset-0 z-[65] flex items-start justify-center p-4 pt-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Reservar cita médica"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md"
        onClick={onCerrar}
        aria-hidden="true"
      />

      {/* Contenedor principal (layout de 2 columnas en desktop) */}
      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-5 animate-modal-in pb-8">

        {/* ── Columna izquierda: Flujo de selección ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Cabecera del formulario */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-7 flex items-center justify-between shadow-xl shadow-black/10">
            <div className="flex items-center gap-4">
              {paso > PASO.ESPECIALIDAD && !exito && (
                <button
                  onClick={retroceder}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Volver al paso anterior"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              <div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-0.5">
                  {exito ? "Confirmación" : `Paso ${paso} de 4`}
                </div>
                <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">
                  {exito              ? "¡Cita Reservada!"
                  : paso === PASO.ESPECIALIDAD ? "Elige tu Especialidad"
                  : paso === PASO.DOCTOR       ? "Selecciona tu Especialista"
                  : paso === PASO.HORARIO      ? "Elige un Horario"
                  : "Datos de tu Consulta"}
                </h2>
              </div>
            </div>
            <button
              onClick={onCerrar}
              aria-label="Cerrar reserva"
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── PANTALLA DE ÉXITO ── */}
          {exito && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-xl shadow-black/10">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={40} />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-3">
                Cita Confirmada
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                Tu cita con <strong className="text-slate-800 dark:text-slate-200">{doctorSeleccionado?.full_name}</strong>
              </p>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                {seleccion.dia} a las {seleccion.franja}
              </p>
              <button onClick={cerrarYReiniciar} className="btn-primario px-8 py-3">
                Ir a mi Portal
              </button>
            </div>
          )}

          {/* ── PASO 1: ESPECIALIDADES ── */}
          {!exito && paso === PASO.ESPECIALIDAD && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-7 shadow-xl shadow-black/10">
              <div className="mb-4">
                <label htmlFor="buscar-especialidad" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Buscar especialidad
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="buscar-especialidad"
                    type="text"
                    value={busquedaEspecialidad}
                    onChange={(e) => setBusquedaEspecialidad(e.target.value)}
                    placeholder="Escribe el nombre de la especialidad"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              {cargandoDatos ? (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">Cargando especialidades...</div>
              ) : especialidadesFiltradas.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No encontramos especialidades con ese nombre.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {especialidadesFiltradas.map((esp) => (
                    <button
                      key={esp.id}
                      onClick={() => seleccionar("especialidadId", esp.id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400 hover:-translate-y-1 ${
                        seleccion.especialidadId === esp.id
                          ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                      }`}
                    >
                      <div className="font-display font-bold text-slate-900 dark:text-white text-sm mb-1">
                        {traducirEspecialidad(esp.name)}
                      </div>
                      {esp.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {esp.description}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-2">
                        <ChevronRight size={12} />
                        Ver médicos
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PASO 2: DOCTORES ── */}
          {!exito && paso === PASO.DOCTOR && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-7 shadow-xl shadow-black/10">
              <div className="mb-4">
                <label htmlFor="buscar-doctor" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Buscar doctor o especialidad
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="buscar-doctor"
                    type="text"
                    value={busquedaDoctor}
                    onChange={(e) => setBusquedaDoctor(e.target.value)}
                    placeholder="Escribe el nombre del profesional"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
              {doctoresFiltrados.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  No hay especialistas que coincidan con tu búsqueda en este momento.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {doctoresFiltrados.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => seleccionar("doctorId", doc.id)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:-translate-y-1 ${
                        seleccion.doctorId === doc.id
                          ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <User size={24} />
                      </div>
                      <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm mb-1">
                        {doc.full_name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">
                        {traducirEspecialidad(doc.specialty_name) || "Especialidad asignada"}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span>Disponible</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PASO 3: HORARIOS ── */}
          {/* ── PASO 3: HORARIOS ── */}
          {!exito && paso === PASO.HORARIO && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-7 shadow-xl shadow-black/10 space-y-6">
              {/* Selección de día */}
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  Día de atención
                </p>
                <div className="flex flex-wrap gap-2">
                  {diasUnicos.map((dia) => (
                    <button
                      key={dia.value}
                      onClick={() => setSeleccion((p) => ({ ...p, dia: dia.value, franja: "" }))}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                        seleccion.dia === dia.value
                          ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500"
                      }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slots de hora dinámicos */}
              {seleccion.dia && (
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Clock size={14} />
                    Horarios disponibles — {seleccion.dia}
                  </p>

                  {cargandoHorarios ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 py-4">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      Consultando agenda del especialista...
                    </div>
                  ) : horariosDisponibles.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      ⚠️ El especialista no cuenta con turnos disponibles para el día seleccionado.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {horariosDisponibles.map((horario) => {
                        // Adaptar según cómo envíe la hora tu backend (si manda string suelto u objeto)
                        const horaTexto = typeof horario === "string" ? horario : horario.scheduled_time?.slice(0, 5);
                        const idHorario = typeof horario === "string" ? horario : horario.id;

                        return (
                          <button
                            key={idHorario}
                            onClick={() => seleccionar("franja", horaTexto)}
                            className={`py-3 px-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                              seleccion.franja === horaTexto
                                ? "border-blue-600 dark:border-blue-400 bg-blue-600 dark:bg-blue-500 text-white"
                                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                            }`}
                          >
                            {horaTexto}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PASO 4: MOTIVO Y CONFIRMACIÓN ── */}
          {!exito && paso === PASO.MOTIVO && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-7 shadow-xl shadow-black/10 space-y-5">
              <div>
                <label
                  htmlFor="motivo"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Motivo de consulta <span className="text-red-500">*</span>
                </label>
                <input
                  id="motivo"
                  type="text"
                  value={seleccion.motivo}
                  onChange={(e) => setSeleccion((p) => ({ ...p, motivo: e.target.value }))}
                  placeholder="Ej: Revisión anual, Control de presión..."
                  className="campo-formulario"
                />
              </div>
              <div>
                <label
                  htmlFor="sintomas"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Síntomas o comentarios (opcional)
                </label>
                <textarea
                  id="sintomas"
                  value={seleccion.sintomas}
                  onChange={(e) => setSeleccion((p) => ({ ...p, sintomas: e.target.value }))}
                  placeholder="Describe brevemente tus síntomas..."
                  rows={3}
                  className="campo-formulario resize-none"
                />
              </div>
              <button
                onClick={() => setPaso(PASO.CONFIRMACION)}
                disabled={!seleccion.motivo.trim()}
                className="w-full btn-secundario flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Revisar Resumen
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* ── Columna derecha: Resumen sticky ── */}
        <aside className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-7 shadow-xl shadow-black/10 lg:sticky lg:top-6 space-y-6">

            {/* Perfil del usuario */}
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-blue-700 dark:bg-blue-500 rounded-xl flex items-center justify-center text-white font-display font-bold text-base">
                {sesion?.avatar || <User size={18} />}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{sesion?.first_name} {sesion?.last_name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{sesion?.email}</div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-4">
                Resumen de Cita
              </p>
              <div className="space-y-4">
                <FilaResumen
                  etiqueta="Especialidad"
                  valor={espSeleccionada?.name}
                  vacio="Sin seleccionar"
                />
                <FilaResumen
                  etiqueta="Especialista"
                  valor={doctorSeleccionado?.full_name}
                  vacio="Sin seleccionar"
                />
                <FilaResumen
                  etiqueta="Día"
                  valor={seleccion.dia}
                  vacio="Sin seleccionar"
                />
                <FilaResumen
                  etiqueta="Hora"
                  valor={seleccion.franja}
                  vacio="Sin seleccionar"
                />
                <FilaResumen
                  etiqueta="Motivo"
                  valor={seleccion.motivo || undefined}
                  vacio="Sin especificar"
                />
              </div>
            </div>

            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                <span>Progreso</span>
                <span>{Math.round(((paso - 1) / 4) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${((paso - 1) / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Botón confirmar (solo en paso de confirmación) */}
            {paso === PASO.CONFIRMACION && !exito && (
              <>
                {errorReserva && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                    {errorReserva}
                  </div>
                )}
                <button
                  onClick={confirmar}
                  disabled={cargando}
                  className="w-full btn-primario flex items-center justify-center gap-3 py-4 disabled:opacity-60"
                >
                  {cargando
                    ? <><Loader2 size={20} className="animate-spin" /> Guardando...</>
                    : <><CalendarCheck size={20} /> Confirmar Cita</>
                  }
                </button>
              </>
            )}

            {/* Info de seguridad */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
                🔒 Tus datos están protegidos y son confidenciales conforme a la normativa de salud peruana.
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

function FilaResumen({ etiqueta, valor, vacio }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide shrink-0">
        {etiqueta}
      </span>
      <span className={`text-sm text-right font-semibold ${
        valor
          ? "text-slate-900 dark:text-white"
          : "text-slate-300 dark:text-slate-600 italic font-normal"
      }`}>
        {valor || vacio}
      </span>
    </div>
  );
}
