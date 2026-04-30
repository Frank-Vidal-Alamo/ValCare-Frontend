import { useState } from "react";
import { Menu, X, Moon, Sun, Lock, LogOut, ChevronDown } from "lucide-react";
import { usarTema } from "../context/TemaContext";

const ENLACES = [
  { etiqueta: "Nosotros",       href: "#nosotros" },
  { etiqueta: "Especialidades", href: "#especialidades" },
  { etiqueta: "Médicos",        href: "#staff" },
  { etiqueta: "Contacto",       href: "#contacto" },
];

export default function Encabezado({ sesion, onAbrirPortal, onCerrarSesion, onIrAlLogin }) {
  const [menuAbierto,    setMenuAbierto]    = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const { modoOscuro, alternarTema }        = usarTema();

  const manejarPortal = () => {
    if (sesion) {
      onAbrirPortal?.();
    } else {
      onIrAlLogin?.();
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <nav className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href="#" className="shrink-0 font-display text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Val<span className="text-blue-700 dark:text-blue-400">Care</span>
          </a>

          {/* Nav escritorio */}
          <ul className="hidden lg:flex items-center gap-7">
            {ENLACES.map((e) => (
              <li key={e.href}>
                <a href={e.href} className="text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-150">
                  {e.etiqueta}
                </a>
              </li>
            ))}
          </ul>

          {/* Acciones */}
          <div className="flex items-center gap-2">

            {/* Toggle tema */}
            <button
              onClick={alternarTema}
              aria-label={modoOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              {modoOscuro ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Con sesión: avatar + dropdown / Sin sesión: botón portal */}
            {sesion ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setDropdownAbierto((v) => !v)}
                  className="flex items-center gap-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2.5 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all"
                >
                  <div className="w-6 h-6 bg-blue-700 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {sesion.avatar || sesion.nombres?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold max-w-[120px] truncate">
                    {sesion.nombres?.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {/* Dropdown */}
                {dropdownAbierto && (
                  <div className="absolute right-0 top-12 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-fade-up">
                    <button
                      onClick={() => { manejarPortal(); setDropdownAbierto(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Lock size={15} />
                      Mi Portal
                    </button>
                    <button
                      onClick={() => { onCerrarSesion(); setDropdownAbierto(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-slate-800"
                    >
                      <LogOut size={15} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={manejarPortal}
                className="hidden md:flex items-center gap-2 btn-primario text-sm"
              >
                <Lock size={15} />
                Portal del Paciente
              </button>
            )}

            {/* Hamburguesa */}
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {menuAbierto ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

        <div className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-5 py-4 flex flex-col gap-1 animate-fade-up">
          {ENLACES.map((e) => (
            <a key={e.href} href={e.href} onClick={() => setMenuAbierto(false)}
              className="py-3 px-4 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {e.etiqueta}
            </a>
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={() => { manejarPortal(); setMenuAbierto(false); }}
              className="flex-1 btn-primario flex items-center justify-center gap-2 text-sm">
              <Lock size={14} />
              {sesion ? "Mi Portal" : "Portal del Paciente"}
            </button>
            {sesion && (
              <button onClick={() => { onCerrarSesion(); setMenuAbierto(false); }}
                className="w-12 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
    </header>
  );
}

