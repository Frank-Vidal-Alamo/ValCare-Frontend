import { CalendarCheck, ChevronRight } from "lucide-react";

const ESTADISTICAS = [
  { valor: "15+", etiqueta: "Años de experiencia" },
  { valor: "48",  etiqueta: "Especialistas certificados" },
  { valor: "98%", etiqueta: "Pacientes satisfechos" },
];

export default function Hero({ onAbrirCita }) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">

      {/* Fondo degradado sin imágenes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950" />
        {/* Círculos decorativos */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-60 h-60 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-5 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

        {/* Texto */}
        <div className="space-y-8 animate-fade-up">
          <span className="etiqueta-seccion">
            Clínica de Excelencia — Lima, Perú
          </span>

          <h1 className="font-display text-5xl md:text-6xl xl:text-7xl font-extrabold dark:text-white leading-[1.08] tracking-tight">
            Tu Salud,{" "}
            <span className="text-blue-700 dark:text-blue-300">
              Nuestra Misión
            </span>
          </h1>

          <p className="text-xl dark:text-slate-200 max-w-lg leading-relaxed">
            En ValCare combinamos tecnología de vanguardia con un trato humano
            excepcional. Porque cada paciente merece lo mejor.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onAbrirCita}
              className="btn-primario flex items-center gap-2 text-base py-4 px-8"
            >
              <CalendarCheck size={20} aria-hidden="true" />
              Reservar mi Cita
            </button>
            <a
              href="#especialidades"
              className="btn-secundario flex items-center gap-2 text-base py-4 px-8"
            >
              Ver Especialidades
              <ChevronRight size={18} aria-hidden="true" />
            </a>
          </div>

          {/* Estadísticas */}
          <div className="flex flex-wrap gap-8 pt-4 border-t border-slate-200 dark:border-slate-800">
            {ESTADISTICAS.map((stat) => (
              <div key={stat.etiqueta}>
                <div className="font-display text-3xl font-extrabold text-blue-700 dark:text-blue-400">
                  {stat.valor}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-300 mt-0.5">
                  {stat.etiqueta}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Imagen principal — en color, sin filtros */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-6 bg-blue-600/5 dark:bg-blue-400/5 rounded-[3rem] blur-2xl" />
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjAk_KxH3DtH3-GbCuG4CZ-Aa52KvUiFfauPso8qTlhQCWtqvj9qP-3Dqt6kzoBsTUgel4z4rYSdUVGPk85ynZEH5EZtcWdotfWnvThBTdmf1yko_HYP-KPDP-wUTKv8ejbQHl9CUh4_qLPvzc1c-nYEPjcL009MIrMkuzA-OAfmFDx4beD8Bw7jx9mXaxrEregRFGMfLrrbXjNRnNyfZycCx-Ohh9kd5HkSWn9osPrKKxx000dZ9ijZAI-2sOG8TPJbERQ59-BCun"
            alt="Médico profesional de ValCare en consulta"
            className="relative w-full rounded-[2.5rem] shadow-2xl shadow-blue-900/15 object-cover"
          />
        </div>
      </div>
    </section>
  );
}
