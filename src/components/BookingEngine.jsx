import { useMemo , useState, useEffect, useCallback } from "react";
import { traducirEspecialidad } from "../utils/traducciones";
import SelectorAgendaSemanal from "./Calendario";
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
  hora:           "",
  horaTexto:      "",
  horaId:         null,
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
  const [todosLosHorarios, setTodosLosHorarios] = useState([]);
  const [modoOscuro] = useState(false);
  

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
      
      // 🟢 Enviamos obligatoriamente ambos parámetros estructurados como el backend los espera
      const respuesta = await fetch(
        `${API_URL}/valcare/schedules?doctor_id=${seleccion.doctorId}&date=${seleccion.dia}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!respuesta.ok) {
        if (respuesta.status === 422) {
          console.error("Error 422: Los parámetros enviados no coinciden con el esquema del backend.");
        }
        throw new Error("No se pudieron obtener los horarios.");
      }

      const data = await respuesta.json();
      console.log("Datos que vienen de FastAPI:", data);
      
      // Guardamos los turnos del día en tu estado original
      setHorariosDisponibles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al traer horarios:", error);
      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  cargarHorariosDelDoctor();
}, [abierto, sesion?.id, seleccion.doctorId, seleccion.dia]);


// ── 3. Filtrar DINÁMICAMENTE solo los días que tienen horas disponibles ──
const diasConHorasDisponibles = useMemo(() => {
  // Extraemos las fechas únicas de los horarios disponibles que vengan del backend
  const fechasConTurnos = todosLosHorarios
    .filter(turno => turno.is_available) // Solo si el turno no está ocupado
    .map(turno => turno.date); // Ej: "2026-07-03"

  const fechasUnicas = [...new Set(fechasConTurnos)].sort();

  return fechasUnicas.map(fechaStr => {
    // Convertimos el string "YYYY-MM-DD" a objeto Date de forma segura local
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fechaLocal = new Date(year, month - 1, day);

    return {
      value: fechaStr,
      label: fechaLocal.toLocaleDateString("es-PE", { weekday: "short", day: "2-digit" }),
      nombreDia: fechaLocal.toLocaleDateString("es-PE", { weekday: "short" }),
      numeroDia: fechaLocal.toLocaleDateString("es-PE", { day: "2-digit" })
    };
  });
}, [todosLosHorarios]);

// ── 1. Estado para controlar la semana que se está visualizando ──
// Inicializa el lunes de la semana actual de forma local segura
const [fechaBase, setFechaBase] = useState(() => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const distanciaAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() + distanciaAlLunes);
  return lunes;
});


  const diasDeLaSemana = useMemo(() => {
  return Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date(fechaBase);
    fecha.setDate(fechaBase.getDate() + index);
    return {
      value: fecha.toISOString().slice(0, 10), // "2026-07-03"
      numeroDia: fecha.getDate(),
      nombreDia: fecha.toLocaleDateString("es-PE", { weekday: "short" }),
      mesAnio: fecha.toLocaleDateString("es-PE", { month: "long", year: "numeric" })
    };
  });
}, [fechaBase]);

// Título dinámico para la cabecera (ej: "Julio 2026")
const rangoMesAnio = diasDeLaSemana[0]?.mesAnio || "";


// ── 3. Funciones para navegar en el tiempo (7 días por click) ──
const semanaAnterior = () => {
  setFechaBase(prev => {
    const nueva = new Date(prev);
    nueva.setDate(prev.getDate() - 7);
    return nueva;
  });
};

const semanaSiguiente = () => {
  setFechaBase(prev => {
    const nueva = new Date(prev);
    nueva.setDate(prev.getDate() + 7);
    return nueva;
  });
};
// ── 4. Horas específicas que se muestran al dar click a un día del mapa ──
const seleccionarDiaYLimpiar = (diaValue) => {
  setSeleccion({
    ...seleccion,
    dia: diaValue,
    horaId: null,
    horaTexto: "",
    franja: "",
    hora: "",
    horaId: null,
  });
};

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
          scheduled_time: `${(seleccion.hora || seleccion.franja || seleccion.horaTexto) || ""}:00`,
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

          {!exito && paso === PASO.HORARIO && (
         <div className={`mt-6 rounded-3xl border overflow-hidden shadow-sm ${modoOscuro ? "border-slate-700/60 bg-slate-950/20" : "border-slate-200 bg-white"}`}>
  
  {/* ── 1. BOTONERA DE NAVEGACIÓN SEMANAL ── */}
  <div className={`flex items-center justify-between px-4 py-3 border-b ${modoOscuro ? "border-slate-700/60 bg-slate-900/30" : "border-slate-200 bg-slate-50/50"}`}>
    <span className={`text-sm font-bold capitalize ${modoOscuro ? "text-slate-200" : "text-slate-700"}`}>
      {rangoMesAnio}
    </span>
    <div className="flex gap-1">
      <button
        type="button"
        onClick={semanaAnterior}
        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
          modoOscuro ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
        }`}
      >
        ◀ Sem. Anterior
      </button>
      <button
        type="button"
        onClick={() => setFechaBase(new Date())} // Botón para volver a la semana de hoy
        className={`px-3 py-2 rounded-xl text-xs font-semibold ${
          modoOscuro ? "bg-slate-800 text-blue-400" : "bg-blue-50 text-blue-600"
        }`}
      >
        Hoy
      </button>
      <button
        type="button"
        onClick={semanaSiguiente}
        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
          modoOscuro ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
        }`}
      >
        Sem. Siguiente ▶
      </button>
    </div>
  </div>

  {/* ── 2. CABECERA DE DÍAS (Clickables para consultar las horas) ── */}
  <div className={`grid grid-cols-7 border-b text-center divide-x divide-slate-200/40 dark:divide-slate-700/30 ${modoOscuro ? "border-slate-700/60 bg-slate-900/50" : "border-slate-200 bg-slate-50/70"}`}>
    {diasDeLaSemana.map((dia) => {
      const esHoy = new Date().toISOString().slice(0, 10) === dia.value;
      const esDiaSeleccionado = seleccion.dia === dia.value;

      return (
        <button
          key={dia.value}
          type="button"
          onClick={() => seleccionarDiaYLimpiar(dia.value)}
          className={`py-3 flex flex-col items-center justify-center gap-1 transition-colors relative group ${
            esDiaSeleccionado 
              ? modoOscuro ? "bg-blue-950/20" : "bg-blue-50/40" 
              : modoOscuro ? "hover:bg-slate-900/40" : "hover:bg-slate-100/50"
          }`}
        >
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            esDiaSeleccionado ? "text-blue-500 font-extrabold" : modoOscuro ? "text-slate-400" : "text-slate-500"
          }`}>
            {dia.nombreDia.replace('.', '')}
          </span>
          
          <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-full transition-all ${
            esDiaSeleccionado 
              ? "bg-blue-600 text-white shadow-md" 
              : esHoy 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400" 
              : modoOscuro ? "text-slate-200" : "text-slate-700"
          }`}>
            {dia.numeroDia}
          </span>
          
          {/* Pequeña barra inferior decorativa si está seleccionado */}
          {esDiaSeleccionado && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
        </button>
      );
    })}
  </div>

  {/* ── 3. CUERPO CENTRAL DE HORARIOS FILTRADOS POR EL DÍA SELECCIONADO ── */}
  <div className={`p-4 min-h-[140px] ${modoOscuro ? "bg-slate-900/10" : "bg-slate-50/30"}`}>
    {!seleccion.dia ? (
      <div className="text-center py-6 text-sm text-slate-400 italic">
        👈 Por favor, selecciona un día de la cabecera del calendario para ver las horas médicas de ValSync.
      </div>
    ) : cargandoHorarios ? (
      <div className="flex flex-col items-center justify-center py-6 gap-2">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 animate-pulse">Consultando disponibilidad con FastAPI...</span>
      </div>
    ) : horariosDisponibles.length === 0 ? (
      <div className="text-center py-6 text-sm text-amber-500 bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 italic">
        El médico no tiene turnos cargados para este día de la semana. Prueba con otra fecha.
      </div>
    ) : (
      <div>
        <span className={`text-[11px] font-bold uppercase tracking-wider block mb-3 ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
          Turnos Disponibles Encontrados:
        </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {horariosDisponibles.map((timeString, index) => {
            // 🟢 VALIDACIÓN: Asegurar que el string tenga texto
            if (!timeString) return null;

            // Como la hora es un string directo, evaluamos si es la seleccionada comparando textos
            const esHoraSeleccionada = seleccion.horaTexto === timeString;
            
            // Procesamos el string "09:00" de forma segura
            const [h, m] = timeString.split(":");
            const h24 = parseInt(h, 10);
            const ampm = h24 >= 12 ? "P.M." : "A.M.";
            const h12 = h24 % 12 || 12;
            const horaBonita = `${String(h12).padStart(2, "0")}:${m} ${ampm}`;

            return (
                <button
                key={`${timeString}-${index}`} // Usamos el string y el índice como key única
                type="button"
                onClick={() => setSeleccion((prev) => ({ ...prev, horaId: index, horaTexto: timeString, franja: timeString, hora: timeString }))}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all border ${
                  esHoraSeleccionada
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.02]"
                    : modoOscuro
                    ? "bg-slate-800 border-slate-700/80 text-slate-200 hover:bg-slate-700"
                    : "bg-white border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                }`}
              >
                {horaBonita}
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
</div>
        )}

        {/* ── BOTÓN DE CONFIRMACIÓN DE PASO ── (Solo visible en PASO.HORARIO) */}
        {!exito && paso === PASO.HORARIO && (
          <div className="mt-6 flex justify-end gap-3 border-t pt-4 dark:border-slate-800">
            <button
              type="button"
              // Borra la fecha y hora seleccionada para poder elegir otra limpia
              onClick={() => setSeleccion({ ...seleccion, dia: null, horaId: null, horaTexto: "" })}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                modoOscuro
                  ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Limpiar Selección
            </button>

            <button
              type="button"
              // Habilitado solo si ya hay un día y un bloque de hora seleccionado
              disabled={!seleccion.dia || !seleccion.horaTexto}
              onClick={() => {
                  // 🟢 Guardar la hora seleccionada y avanzar al formulario de Motivo
                  setSeleccion((prev) => ({
                    ...prev,
                    hora: prev.horaTexto,
                  }));

                  setPaso(PASO.MOTIVO);
                }}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                seleccion.dia && seleccion.horaTexto
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 active:scale-[0.98]"
                  : "bg-slate-200 text-slate-400 dark:bg-slate-800/60 dark:text-slate-600 cursor-not-allowed"
              }`}
            >
              Confirmar Horario y Avanzar →
            </button>
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
                  valor={seleccion.hora || seleccion.franja || seleccion.horaTexto}
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
