import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import EkuBankLogo from '../EkuBankLogo';

const Register = ({ onNavigateToLogin }) => {
  const [form, setForm] = useState({ nombre: '', apellido: '', dni: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleDni = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, '');
    if (v.length <= 8) setForm({ ...form, dni: v });
  };

  const handlePassword = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, '');
    if (v.length <= 6) setForm({ ...form, password: v });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.dni.length < 8) { setMsg('El DNI debe tener exactamente 8 dígitos.'); setIsSuccess(false); return; }
    if (form.password.length < 6) { setMsg('La clave debe tener exactamente 6 dígitos.'); setIsSuccess(false); return; }

    setIsLoading(true);
    setMsg('');
    try {
      const res = await fetch('https://ekubank.ekubyte.net.pe/api/controllers/RegisterController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setMsg(data.message);
      setIsSuccess(data.success);
    } catch {
      setMsg('Error de conexión. Intenta nuevamente.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full border-[1.5px] border-[#E0E6ED] rounded-[10px] bg-[#F8FAFC] focus:border-[#1973B8] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] focus:bg-white outline-none text-[14px] text-[#1A2B4A] px-3.5 h-[46px] placeholder:text-[#B0BEC5] transition-all";

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col relative overflow-hidden">
      {/* ── ALERTA ENTORNO ACADÉMICO / SIMULACIÓN ── */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-[12px] font-bold shadow-sm relative z-50 flex items-center justify-center gap-2">
        <svg className="w-4.5 h-4.5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.52 13.064c-.377.162-.77.304-1.177.424A9.12 9.12 0 001 18.062c0 .937.121 1.848.349 2.718A12.011 12.011 0 0012 23c2.907 0 5.598-.87 7.854-2.36a11.97 11.97 0 00.347-2.718A9.12 9.12 0 0018.5 13.5c-.407-.12-.8-.262-1.177-.424" />
        </svg>
        <span>ATENCIÓN: Este sitio es una SIMULACIÓN ACADÉMICA de banca por internet para un proyecto de la Universidad. No es un banco real.</span>
      </div>

      {/* Decorative */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#004481] opacity-[0.06] pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-[#1973B8] opacity-[0.07] pointer-events-none" />
      <div className="absolute top-1/2 right-[-100px] w-[300px] h-[300px] rounded-full bg-[#49D0A0] opacity-[0.04] pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-[#004481] h-[60px] px-7 flex items-center justify-between relative z-10 shadow-md">
        <EkuBankLogo size={140} color="#ffffff" withDot />
        <button onClick={onNavigateToLogin} className="text-white/70 text-[13px] font-medium hover:text-white transition-colors flex items-center gap-1.5">
          Volver al login &nbsp;✕
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px]"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_40px_rgba(0,68,129,0.10),0_1px_4px_rgba(0,68,129,0.06)]">
            {/* Blue banner */}
            <div className="relative overflow-hidden px-8 pt-7 pb-6"
              style={{ background: 'linear-gradient(135deg, #004481 0%, #1565C0 100%)' }}>
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
              <div className="absolute right-5 -bottom-14 w-28 h-28 rounded-full bg-white/[0.04]" />
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-white/65 text-[10.5px] font-semibold tracking-[1.5px] uppercase mb-1.5">Nuevo cliente</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-white text-[26px] font-semibold leading-tight">Crea tu cuenta<br />EkuBank</motion.h1>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-white/60 text-[13px] font-light mt-1.5">100% digital, en solo 2 minutos</motion.p>
            </div>

            {/* Form */}
            <div className="px-8 pt-6 pb-7">
              <AnimatePresence>
                {msg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`border-l-[3px] rounded-r-lg p-3 mb-4 text-[12.5px] font-medium ${
                      isSuccess ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'
                    }`}
                  >{msg}</motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombres + Apellidos */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-1.5">Nombres</label>
                    <input type="text" placeholder="Juan Carlos" value={form.nombre} onChange={update('nombre')} required className={inputClass} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                    <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-1.5">Apellidos</label>
                    <input type="text" placeholder="Pérez López" value={form.apellido} onChange={update('apellido')} required className={inputClass} />
                  </motion.div>
                </div>

                {/* DNI */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-1.5">DNI (8 dígitos)</label>
                  <input type="text" inputMode="numeric" placeholder="12345678" value={form.dni} onChange={handleDni} required maxLength={8} className={inputClass} />
                </motion.div>

                {/* Email */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-1.5">Correo electrónico</label>
                  <input type="email" placeholder="juan@correo.com" value={form.email} onChange={update('email')} required className={inputClass} />
                </motion.div>

                {/* Clave 6 dígitos */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-1.5">Clave digital (6 dígitos)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      inputMode="numeric"
                      placeholder="••••••"
                      value={form.password}
                      onChange={handlePassword}
                      required
                      maxLength={6}
                      className={`${inputClass} pr-16 tracking-[0.25em] font-mono text-center text-[18px] placeholder:text-[14px] placeholder:tracking-normal placeholder:font-sans`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1973B8] uppercase tracking-[0.5px] px-1.5 py-1 rounded hover:bg-[#1973B8]/10 transition-colors"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 ml-0.5">Solo números. Recuérdala bien.</p>
                </motion.div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-[10px] bg-[#004481] hover:bg-[#1565C0] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-65 disabled:cursor-not-allowed mt-1"
                >
                  {isLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando cuenta...</>
                  ) : isSuccess ? (
                    '¡Cuenta creada exitosamente!'
                  ) : (
                    'Crear mi cuenta'
                  )}
                </motion.button>
              </form>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="text-center mt-4">
                <button onClick={onNavigateToLogin}
                  className="text-[#1973B8] text-[12.5px] font-medium hover:text-[#004481] transition-colors">
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Register;
