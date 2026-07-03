import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { Clock, Loader2, Calendar } from "lucide-react";

export default function SelectorAgendaSemanal({
  doctorId,
  fechaSeleccionada,
  horaSeleccionada,
  horariosDisponibles,
  cargando,
  onSeleccionarFecha,
  onSeleccionarHora
}) {
  // Aquí puedes generar los días de la semana actual de forma más dinámica si lo requieres
  const diasSemana = Array.from({ length: 6 }, (_, index) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + index);
    return {
      value: fecha.toISOString().slice(0, 10),
      label: fecha.toLocaleDateString("es-PE", { weekday: "short", day: "2-digit" }),
    };
  });

  return (
    <div className="space-y-6">
      {/* Selector de pestañas de días */}
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Calendar size={14} /> Selecciona el día
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {diasSemana.map((dia) => (
            <button
              key={dia.value}
              type="button"
              onClick={() => onSeleccionarFecha(dia.value)}
              className={`p-3 rounded-2xl border-2 text-center transition-all ${
                fechaSeleccionada === dia.value
                  ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-bold"
                  : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 hover:border-blue-400"
              }`}
            >
              <span className="block text-xs uppercase opacity-60">{dia.label.split(" ")[0]}</span>
              <span className="block text-lg font-display font-extrabold">{dia.label.split(" ")[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid de horas del día seleccionado */}
      {fechaSeleccionada && (
        <div className="pt-2">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Clock size={14} /> Horarios disponibles para el {fechaSeleccionada}
          </p>

          {cargando ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 py-6 justify-center">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              Buscando turnos en la agenda...
            </div>
          ) : horariosDisponibles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
              ⚠️ No hay turnos disponibles para este día. Intenta con otra fecha.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {horariosDisponibles.map((horario) => {
                const horaTexto = typeof horario === "string" ? horario : horario.scheduled_time?.slice(0, 5);
                const idHorario = typeof horario === "string" ? horario : horario.id;

                return (
                  <button
                    key={idHorario}
                    type="button"
                    onClick={() => onSeleccionarHora(horaTexto)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      horaSeleccionada === horaTexto
                        ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                        : "border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-blue-400"
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
  );
}