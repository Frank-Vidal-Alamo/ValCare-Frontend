const ENLACES_LEGALES = [
  { etiqueta: "Política de Privacidad", href: "#" },
  { etiqueta: "Términos de Servicio",   href: "#" },
  { etiqueta: "Transparencia",          href: "#" },
];

export default function PieDePagina() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Marca */}
        <div className="space-y-3">
          <div className="font-display text-2xl font-extrabold text-white tracking-tight">
            Val<span className="text-blue-400">Care</span>
          </div>
          <p className="text-sm leading-relaxed">
            Comprometidos con la innovación y el bienestar de cada paciente.
            Lima, Perú.
          </p>
        </div>

        {/* Contacto */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm mb-3">Contacto</h4>
          <p className="text-sm">Av. Salud Progresiva 123, San Isidro</p>
          <p className="text-sm">+51 (01) 456-7890</p>
          <p className="text-sm">contacto@valcare.pe</p>
        </div>

        {/* Legal */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-sm mb-3">Legal</h4>
          {ENLACES_LEGALES.map((e) => (
            <a
              key={e.etiqueta}
              href={e.href}
              className="block text-sm hover:text-white transition-colors"
            >
              {e.etiqueta}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 mt-10 pt-6 border-t border-slate-800 text-center text-xs">
        © {new Date().getFullYear()} ValCare Clínica Médica. Todos los derechos reservados.
      </div>
    </footer>
  );
}
