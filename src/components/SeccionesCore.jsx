import {
  Microscope, Award, ClipboardList, Clock,
  Heart, Baby, Stethoscope, FlaskConical, Eye,
  CalendarPlus, ArrowRight,
} from "lucide-react";

/* ── COMPONENTE DE FONDO REUTILIZABLE (Igual al Hero) ── */
const FondoSeccion = ({ invertido = false }) => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className={`absolute inset-0 transition-colors duration-300 ${
      invertido 
        ? "bg-slate-50 dark:bg-slate-900" 
        : "bg-white dark:bg-slate-950"
    }`} />
    {/* Círculos decorativos sutiles para dar profundidad como en el Hero */}
    <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-100/20 dark:bg-blue-500/5 rounded-full blur-3xl" />
    <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-indigo-100/20 dark:bg-indigo-500/5 rounded-full blur-3xl" />
  </div>
);

/* ── Por qué elegirnos ── */
const PILARES = [
  {
    icono: <Microscope size={32} aria-hidden="true" />,
    titulo: "Tecnología de Punta",
    descripcion: "Equipamiento de última generación para diagnósticos precisos y tratamientos mínimamente invasivos.",
  },
  {
    icono: <Award size={32} aria-hidden="true" />,
    titulo: "Especialistas Certificados",
    descripcion: "Médicos formados en las mejores instituciones nacionales e internacionales.",
  },
  {
    icono: <ClipboardList size={32} aria-hidden="true" />,
    titulo: "Atención Integral",
    descripcion: "Seguimiento continuo y personalizado en cada etapa de su recuperación.",
  },
  {
    icono: <Clock size={32} aria-hidden="true" />,
    titulo: "Atención 24/7",
    descripcion: "Disponibles para emergencias y consultas urgentes en cualquier momento.",
  },
];

export function PorQueElegirnos() {
  return (
    <section id="nosotros" className="relative py-24 overflow-hidden">
      <FondoSeccion /> {/* Fondo tipo Hero */}
      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="etiqueta-seccion mb-3">Nuestros Pilares</p>
          <h2 className="titulo-seccion mb-4">Por qué elegir ValCare</h2>
          <p className="dark:text-slate-200 text-lg">
            Redefiniendo el estándar del cuidado médico con calidad y calidez.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILARES.map((p, i) => (
            <div
              key={i}
              className="tarjeta p-8 group hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-700 dark:text-blue-400 group-hover:bg-blue-700 dark:group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                {p.icono}
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-3">
                {p.titulo}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {p.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Especialidades ── */
const ESPECIALIDADES = [
  { icono: <Heart size={26} />,       nombre: "Cardiología",      color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20" },
  { icono: <Baby size={26} />,        nombre: "Pediatría",        color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { icono: <Eye size={26} />,         nombre: "Oftalmología",     color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/20" },
  { icono: <Stethoscope size={26} />, nombre: "Medicina General", color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-900/20" },
  { icono: <FlaskConical size={26} />,nombre: "Laboratorio",      color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20" },
];

export function Especialidades() {
  return (
    <section id="especialidades" className="relative py-24 overflow-hidden">
      <FondoSeccion invertido={true} /> {/* Fondo tipo Hero (Grisáceo) */}
      <div className="relative max-w-7xl mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
          <div>
            <p className="etiqueta-seccion mb-3">Servicios Médicos</p>
            <h2 className="titulo-seccion">Nuestras Especialidades</h2>
          </div>
          <a href="#citas" className="btn-secundario flex items-center gap-2 shrink-0">
            Ver todas <ArrowRight size={16} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {ESPECIALIDADES.map((e, i) => (
            <div
              key={i}
              className="tarjeta p-7 group hover:shadow-lg dark:hover:border-slate-700 cursor-pointer"
            >
              <div className={`w-12 h-12 ${e.bg} ${e.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {e.icono}
              </div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white text-base mb-2">
                {e.nombre}
              </h4>
              <span className={`${e.color} text-xs font-bold flex items-center gap-1 mt-4`}>
                Ver más <ArrowRight size={12} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MEDICOS = [
  {
    nombre: "Dr. Alexander Vidal",
    especialidad: "Cardiología",
    descripcion: "Especialista en cirugía cardiovascular con más de 15 años de experiencia.",
    imagen: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    alt: "Dr. Alexander Vidal - Cardiólogo"
  },
  {
    nombre: "Dra. Elena Samaniego",
    especialidad: "Pediatría",
    descripcion: "Dedicada al cuidado integral infantil y medicina preventiva.",
    imagen: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400",
    alt: "Dra. Elena Samaniego - Pediatra"
  },
  {
    nombre: "Dr. Ricardo Alva",
    especialidad: "Oftalmología",
    descripcion: "Experto en microcirugía ocular y tratamiento de cataratas.",
    imagen: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    alt: "Dr. Ricardo Alva - Oftalmólogo"
  },
  {
    nombre: "Dra. Marina Torres",
    especialidad: "Medicina General",
    descripcion: "Enfoque en medicina familiar y diagnóstico preventivo.",
    imagen: "https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400",
    alt: "Dra. Marina Torres - Medicina General"
  }
];

/* ── Staff Médico ── */
export function StaffMedico({ onAbrirCita }) {
  return (
    <section id="staff" className="relative py-24 overflow-hidden">
      {/* Aplicamos el fondo dinámico estilo Hero */}
      <FondoSeccion /> 

      <div className="relative max-w-7xl mx-auto px-5">
        <div className="mb-14 animate-fade-up">
          <p className="etiqueta-seccion mb-3">Liderazgo Clínico</p>
          <h2 className="titulo-seccion mb-4">Nuestros Especialistas</h2>
          <p className="dark:text-slate-200 text-lg max-w-xl">
            Los mejores profesionales, dedicados a transformar vidas a través de la medicina.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {MEDICOS.map((m, i) => (
            <div 
              key={i} 
              className="tarjeta overflow-hidden group hover:shadow-xl dark:hover:shadow-slate-950 transition-all duration-300"
            >
              {/* Contenedor de Imagen */}
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={m.imagen}
                  alt={m.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Información del Médico */}
              <div className="p-6">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold text-xs tracking-widest mb-2">
                  {m.especialidad}
                </div>
                <h4 className="font-display font-bold text-slate-900 dark:text-white text-lg mb-1">
                  {m.nombre}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-300 mb-5">
                  {m.descripcion}
                </p>
                
                {/* Botón dinámico */}
                <button
                  onClick={onAbrirCita}
                  className="w-full btn-secundario flex items-center justify-center gap-2 text-sm py-2.5 transition-colors"
                >
                  <CalendarPlus size={16} aria-hidden="true" />
                  Reservar Cita
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contacto y Ubicación ── */
export function Contacto() {
  return (
    <section id="contacto" className="relative py-24 overflow-hidden">
      {/* Fondo dinámico estilo Hero con inversión de color para contraste */}
      <FondoSeccion invertido={true} />

      <div className="relative max-w-7xl mx-auto px-5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="etiqueta-seccion mb-3">Encuéntranos</p>
          <h2 className="titulo-seccion mb-4">Ubicación y Contacto</h2>
          <p className="dark:text-slate-200 text-lg">
            Visítanos en nuestra moderna clínica ubicada en el corazón de San Isidro.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="space-y-6">
            {/* Dirección */}
            <div className="tarjeta p-6 hover:shadow-lg transition-all group">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">Dirección</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    Av. Salud Progresiva 123<br />
                    San Isidro, Lima 27, Perú
                  </p>
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div className="tarjeta p-6 hover:shadow-lg transition-all group">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.568.785c.25.789.75 2.053 2.488 3.786 1.738 1.733 2.997 2.237 3.786 2.487l.785-1.568a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">Teléfono</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">+51 (01) 456-7890</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Atención 24/7</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="tarjeta p-6 hover:shadow-lg transition-all group">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-900 dark:text-white mb-1">Email</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold">contacto@valcare.pe</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Respuesta en 2 horas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa con filtro para modo oscuro */}
          <div className="tarjeta overflow-hidden hover:shadow-lg transition-all h-full min-h-[500px] border-2 border-slate-100 dark:border-slate-800">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.836649854747!2d-77.03628!3d-12.0953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8d4d8d4d4d5%3A0x1234567890abcdef!2sAv.%20Salud%20Progresiva%20123%2C%20San%20Isidro%2C%20Lima!5e0!3m2!1ses!2spe!4v1234567890"
              width="100%"
              height="100%"
              className="grayscale-[20%] contrast-[1.1] dark:invert-[90%] dark:hue-rotate-180"
              style={{ border: 0, minHeight: '500px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de ValCare Clínica Médica"
            />
          </div>
        </div>

        {/* Banner inferior de CTA */}
        <div className="mt-16 text-center p-8 bg-white/50 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-blue-200 dark:border-blue-800/30 shadow-sm">
          <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-3">
            ¿Necesitas agendar una cita?
          </h3>
          <p className="dark:text-slate-200 mb-6 max-w-lg mx-auto">
            Nuestro equipo está listo para ayudarte. Contáctanos por teléfono, email o agenda tu cita directamente en nuestro portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+51014567890" className="btn-primario flex items-center justify-center gap-2">
              Llamar Ahora
            </a>
            <a href="mailto:contacto@valcare.pe" className="btn-secundario flex items-center justify-center gap-2">
              Enviar Email
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}