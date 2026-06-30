import { useState, useEffect } from "react";
import {
  Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle,
  User, ArrowRight, Stethoscope,  FileText, Calendar
} from "lucide-react";
import { usarTema } from "../context/TemaContext";

const VISTA = { LOGIN: "login", REGISTRO: "registro" };
const API_URL = import.meta.env?.VITE_API_URL; 


const ESTADO_FORM_INICIAL = { 
  document_number: "",
  first_name: "", 
  last_name: "", 
  birth_date: "",
  gender: "MALE",
  correo: "", 
  contrasena: "", 
  confirmar: "" 
};

export default function LoginPage({ onLoginExito }) {
  const [vista, setVista] = useState(VISTA.LOGIN);
  const [form, setForm] = useState(ESTADO_FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const { modoOscuro } = usarTema();

  const iniciarSesion = async () => {
    const nuevosErrores = {};
    if (!form.correo.includes("@")) nuevosErrores.correo = "Correo inválido";
    if (!form.contrasena) nuevosErrores.contrasena = "Campo requerido";
    
    if (Object.keys(nuevosErrores).length) {
      setErrores(nuevosErrores);
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      const detallesLogin = new URLSearchParams();
      detallesLogin.append("username", form.correo);
      detallesLogin.append("password", form.contrasena);

      const respuesta = await fetch(`${API_URL}/valcare/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
        body: detallesLogin,
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.detail || "Correo o contraseña incorrectos.");
      }

      if (data.access_token) {
        localStorage.setItem("valcare_token", data.access_token);
      }
      
      const usuarioSesion = { email: form.correo, role: "PATIENT" };
      localStorage.setItem("valcare_sesion", JSON.stringify(usuarioSesion));
      
      onLoginExito(usuarioSesion);
    } catch (error) {
      setMensaje({ tipo: "error", texto: error.message });
    } finally {
      setCargando(false);
    }
  };

  const cambiar = (e) => {
  const { name, value } = e.target;

  if (name === "document_number") {
    // 🟢 Filtrar en tiempo real: Solo permite números y máximo 8 caracteres
    const soloNumeros = value.replace(/\D/g, "");
    if (soloNumeros.length <= 8) {
      setForm((prev) => ({ ...prev, [name]: soloNumeros }));
    }
  } else {
    // Comportamiento normal para el resto de los campos
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Limpiar el error del campo que se está editando
  if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));
  setMensaje(null);
};

  const registrarse = async () => {
  const nuevosErrores = {};

  // 1. Validaciones del Frontend (Primera capa de defensa)
  if (!form.document_number.trim()) {
    nuevosErrores.document_number = "Campo requerido";
  } else if (form.document_number.length !== 8) {
    nuevosErrores.document_number = "El DNI debe tener exactamente 8 dígitos";
  }

  if (!form.first_name.trim()) nuevosErrores.first_name = "Campo requerido";
  if (!form.last_name.trim()) nuevosErrores.last_name = "Campo requerido";
  if (!form.birth_date) nuevosErrores.birth_date = "Campo requerido";
  if (!form.gender) nuevosErrores.gender = "Selecciona tu género";

  if (!form.correo.includes("@")) {
    nuevosErrores.correo = "Correo inválido";
  }

  // Validar contraseña con el criterio estricto del Backend (Mínimo 6 caracteres y al menos 1 número)
  const tieneNumero = /\d/.test(form.contrasena);
  const tieneCaracterEspecial = /[^A-Za-z0-9]/.test(form.contrasena);
  if (form.contrasena.length < 6) {
    nuevosErrores.contrasena = "Mínimo 6 caracteres";
  } else if (!tieneNumero) {
    nuevosErrores.contrasena = "La contraseña debe contener al menos un número";
  } else if (!tieneCaracterEspecial) {
  nuevosErrores.contrasena = "La contraseña debe contener al menos un carácter especial (ej: ., @, #, $)";
  }

  if (form.contrasena !== form.confirmar) {
    nuevosErrores.confirmar = "Las contraseñas no coinciden";
  }

  // Si hay errores locales, detenemos el envío y los pintamos
  if (Object.keys(nuevosErrores).length) {
    setErrores(nuevosErrores);
    return;
  }

  setCargando(true);
  setMensaje(null);

  try {
    const respuesta = await fetch(`${API_URL}/valcare/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_number: form.document_number.trim(), 
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        birth_date: form.birth_date,
        email: form.correo.trim(),
        password: form.contrasena,
        gender: form.gender
      }),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      // 2. Manejo de Excepciones de Validación del Backend (FastAPI 422 Unprocessable Content)
      if (respuesta.status === 422 && Array.isArray(data.detail)) {
        const erroresFastAPI = {};
        
        data.detail.forEach((err) => {
          // err.loc[1] contiene el nombre del campo que falló en el esquema Pydantic (ej: 'password')
          const campoBackend = err.loc[1];
          
          // Sincronizar nombres del backend con las claves de tu estado en React
          let campoFrontend = campoBackend;
          if (campoBackend === "email") campoFrontend = "correo";
          if (campoBackend === "password") campoFrontend = "contrasena";
          
          erroresFastAPI[campoFrontend] = err.msg; 
        });

        setErrores(erroresFastAPI);
        throw new Error("Por favor, corrige los campos marcados por el servidor.");
      }

      // 3. Manejo de Errores de Negocio Controlados (409 Conflict, etc.)
      throw new Error(data.detail || "Error al registrar el paciente.");
    }

    // Registro exitoso
    setMensaje({ tipo: "exito", texto: "¡Paciente registrado con éxito!" });
    
    // Almacenar la sesión con el objeto estructurado que retorna tu backend
    if (data.token) localStorage.setItem("valcare_token", data.token);
    localStorage.setItem("valcare_sesion", JSON.stringify(data));
    
    setTimeout(() => {
      onLoginExito(data);
    }, 1500);

  } catch (error) {
    setMensaje({ tipo: "error", texto: error.message });
  } finally {
    setCargando(false);
  }
};

  return (
    <div className={`min-h-screen w-full flex overflow-hidden ${
      modoOscuro
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
        : "bg-gradient-to-br from-blue-50 via-white to-blue-50"
    }`}>

      {/* Patrón de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute inset-0 ${modoOscuro ? "bg-blue-500" : "bg-blue-400"}`}
          style={{
            backgroundImage: `radial-gradient(circle at 20px 30px, ${modoOscuro ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.15)"} 2px, transparent 2px)`,
            backgroundSize: "40px 60px"
          }}
        />
      </div>

      {/* Panel izquierdo: Branding (solo en desktop) */}
      <div className={`hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10 ${
        modoOscuro
          ? "bg-gradient-to-b from-blue-950 to-slate-900"
          : "bg-gradient-to-b from-blue-600 to-blue-700"
      }`}>

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display font-black text-xl ${
              modoOscuro
                ? "bg-blue-500/20 text-blue-300"
                : "bg-white/20 text-white"
            }`}>
              <Stethoscope size={24} />
            </div>
            <div className={`font-display text-3xl font-extrabold ${modoOscuro ? "text-white" : "text-white"}`}>
              Val<span className={modoOscuro ? "text-blue-300" : "text-blue-100"}>Care</span>
            </div>
          </div>
          <p className={`text-sm ${modoOscuro ? "text-blue-200/60" : "text-white/60"}`}>
            Tu salud, nuestra prioridad
          </p>
        </div>

        {/* Contenido de marca */}
        <div className="space-y-8">
          <div>
            <h2 className={`text-4xl font-display font-extrabold mb-4 ${modoOscuro ? "text-white" : "text-white"}`}>
              Bienvenido al Portal de Salud
            </h2>
            <p className={`text-lg ${modoOscuro ? "text-blue-100/80" : "text-white/80"}`}>
              Gestiona tus citas médicas, accede a tu historial de salud y comunícate con nuestros especialistas de forma segura.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icono: "✓", texto: "Reserva citas en segundos" },
              { icono: "✓", texto: "Historial médico completo" },
              { icono: "✓", texto: "Acceso 24/7 desde cualquier dispositivo" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  modoOscuro
                    ? "bg-blue-500/30 text-blue-300"
                    : "bg-white/20 text-white"
                }`}>
                  {item.icono}
                </div>
                <span className={modoOscuro ? "text-blue-100" : "text-white"}>{item.texto}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className={`text-xs ${modoOscuro ? "text-blue-300/50" : "text-white/40"}`}>
          © 2024 ValCare. Todos los derechos reservados.
        </p>
      </div>

      {/* Panel derecho: Formulario */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10`}>
        <div className={`w-full max-w-md ${
          modoOscuro
            ? "bg-slate-800/50 backdrop-blur-xl border border-slate-700/50"
            : "bg-white/80 backdrop-blur-xl border border-white/40"
        } rounded-3xl shadow-2xl p-8`}>

          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            {[
              { id: VISTA.LOGIN, label: "Ingresar" },
              { id: VISTA.REGISTRO, label: "Registrarse" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setVista(tab.id); setErrores({}); setMensaje(null); }}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all text-sm ${
                  vista === tab.id
                    ? modoOscuro
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : modoOscuro
                      ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/70"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mensaje de feedback */}
          {mensaje && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl mb-6 text-sm font-medium animate-pulse ${
              mensaje.tipo === "exito"
                ? modoOscuro
                  ? "bg-emerald-900/30 border border-emerald-600/40 text-emerald-300"
                  : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : modoOscuro
                  ? "bg-red-900/30 border border-red-600/40 text-red-300"
                  : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              {mensaje.tipo === "exito"
                ? <CheckCircle size={18} className="shrink-0 mt-0.5" />
                : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
              {mensaje.texto}
            </div>
          )}

          {/* ── VISTA: LOGIN ── */}
          {vista === VISTA.LOGIN && (
            <div className="space-y-5">
              <h3 className={`font-display font-bold text-2xl mb-6 ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                Bienvenido de vuelta
              </h3>

              <CampoForm
                label="Correo Electrónico"
                name="correo"
                type="email"
                value={form.correo}
                onChange={cambiar}
                error={errores.correo}
                placeholder="tu@correo.pe"
                icono={<Mail size={16} />}
                modoOscuro={modoOscuro}
              />

              <div className="relative">
                <CampoForm
                  label="Contraseña"
                  name="contrasena"
                  type={verPass ? "text" : "password"}
                  value={form.contrasena}
                  onChange={cambiar}
                  error={errores.contrasena}
                  placeholder="••••••••"
                  icono={<Lock size={16} />}
                  modoOscuro={modoOscuro}
                />
                <button
                  type="button"
                  onClick={() => setVerPass((v) => !v)}
                  className={`absolute right-3 top-9 transition-colors ${
                    modoOscuro
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  aria-label={verPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                onClick={iniciarSesion}
                disabled={cargando}
                className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                  modoOscuro
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/30"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:shadow-blue-600/30"
                }`}
              >
                {cargando ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {cargando ? "Verificando..." : "Ingresar"}
              </button>
            </div>
          )}

          {/* ── VISTA: REGISTRO ── */}
          {vista === VISTA.REGISTRO && (
            <div className="space-y-5">
              <h3 className={`font-display font-bold text-2xl mb-6 ${modoOscuro ? "text-white" : "text-slate-900"}`}>
                Crear mi cuenta
              </h3>

              <CampoForm 
              label="Nro Documento (DNI/Cédula)" 
              name="document_number" 
              value={form.document_number} 
              onChange={cambiar} 
              error={errores.document_number} 
              placeholder="12345678"
              maxLength={8}           
              inputMode="numeric"
              icono={<FileText size={16} />} 
              modoOscuro={modoOscuro} 
            />

            <CampoForm 
              label="Nombres" 
              name="first_name" 
              value={form.first_name} 
              onChange={cambiar} 
              error={errores.first_name} 
              placeholder="Juan" 
              icono={<User size={16} />} 
              modoOscuro={modoOscuro} 
            />

            <CampoForm 
              label="Apellidos" 
              name="last_name" 
              value={form.last_name} 
              onChange={cambiar} 
              error={errores.last_name} 
              placeholder="García López" 
              icono={<User size={16} />} 
              modoOscuro={modoOscuro} 
            />

            <CampoForm 
              label="Fecha de Nacimiento" 
              name="birth_date" 
              type="date" // <-- Renderiza un calendario nativo
              value={form.birth_date} 
              onChange={cambiar} 
              error={errores.birth_date} 
              icono={<Calendar size={16} />} 
              modoOscuro={modoOscuro} 
            />

            <div>
              <label htmlFor="gender" className={`block text-sm font-semibold mb-2 ${modoOscuro ? "text-slate-300" : "text-slate-700"}`}>
                Género (Requerido para historial clínico) 
              </label>
              <div className="relative">
                <select
                  id="gender"
                  name="gender"
                  value={form.gender}
                  onChange={cambiar}
                  className={`w-full px-4 py-3 rounded-xl transition-all font-medium appearance-none outline-none cursor-pointer ${
                    modoOscuro
                      ? "bg-slate-700/50 border border-slate-600/50 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      : "bg-white border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  }`}
                >
                  <option value="MALE">Masculino</option>
                  <option value="FEMALE">Femenino</option>
                  <option value="OTHER">Otro</option>
                </select>
                {/* Flecha decorativa del select */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
            </div>

              <CampoForm
                label="Correo Electrónico"
                name="correo"
                type="email"
                value={form.correo}
                onChange={cambiar}
                error={errores.correo}
                placeholder="tu@correo.pe"
                icono={<Mail size={16} />}
                modoOscuro={modoOscuro}
              />

              <CampoForm
                label="Contraseña"
                name="contrasena"
                type={verPass ? "text" : "password"}
                value={form.contrasena}
                onChange={cambiar}
                error={errores.contrasena}
                placeholder="Mínimo 6 caracteres"
                icono={<Lock size={16} />}
                modoOscuro={modoOscuro}
              />

              <CampoForm
                label="Confirmar contraseña"
                name="confirmar"
                type={verPass ? "text" : "password"}
                value={form.confirmar}
                onChange={cambiar}
                error={errores.confirmar}
                placeholder="Repite tu contraseña"
                icono={<Lock size={16} />}
                modoOscuro={modoOscuro}
              />

              <button
                onClick={registrarse}
                disabled={cargando}
                className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                  modoOscuro
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-600/30"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-600/30"
                }`}
              >
                {cargando ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                {cargando ? "Creando tu cuenta..." : "Crear Cuenta"}
              </button>
            </div>
          )}

          {/* Términos */}
          <p className={`text-xs text-center mt-6 ${modoOscuro ? "text-slate-400" : "text-slate-500"}`}>
            Al acceder aceptas nuestros{" "}
            <button className={modoOscuro ? "text-blue-400 hover:underline" : "text-blue-600 hover:underline"}>
              términos de servicio
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Subcomponente: Campo del formulario ── */
function CampoForm({ label, name, value, onChange, error, icono, modoOscuro, ...props }) {
  return (
    <div>
      <label
        htmlFor={name}
        className={`block text-sm font-semibold mb-2 ${modoOscuro ? "text-slate-300" : "text-slate-700"}`}
      >
        {label}
      </label>
      <div className="relative">
        {icono && (
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
            modoOscuro ? "text-slate-500" : "text-slate-400"
          }`}>
            {icono}
          </div>
        )}
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-3 ${icono ? "pl-10" : ""} rounded-xl transition-all font-medium ${
            modoOscuro
              ? `bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none ${
                  error ? "border-red-500/50 focus:ring-red-500/20" : ""
                }`
              : `bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none ${
                  error ? "border-red-500 focus:ring-red-500/20" : ""
                }`
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className={`text-xs mt-1.5 flex items-center gap-1 ${
          modoOscuro ? "text-red-400" : "text-red-600"
        }`}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
