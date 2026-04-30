import { CalendarCheck } from "lucide-react";

export default function BotonagenCita({ onClick }) {
  return (
    <div className="fixed bottom-8 right-8 z-40 hidden md:block">
      <button
        onClick={onClick}
        aria-label="Agendar cita ahora"
        className="group flex items-center gap-3 bg-blue-700 dark:bg-blue-500 text-white
                   px-6 py-4 rounded-full shadow-xl shadow-blue-700/30
                   hover:bg-blue-800 dark:hover:bg-blue-400
                   hover:shadow-blue-700/50 hover:scale-105
                   transition-all duration-200 active:scale-95 font-semibold"
      >
        <CalendarCheck size={20} aria-hidden="true" />
        <span>Reservar Cita</span>
      </button>
    </div>
  );
}