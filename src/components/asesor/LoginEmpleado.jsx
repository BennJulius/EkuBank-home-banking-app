import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import EkuBankLogo from '../EkuBankLogo';

const LoginEmpleado = ({ onLoginSuccess, onNavigateToHome }) => {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('ekubank_emp_block');
    if (stored) {
      const until = parseInt(stored, 10);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setBloqueado(true);
        setCountdown(remaining);
        setError(`Acceso bloqueado por seguridad. Espera ${Math.ceil(remaining / 60)} minuto(s).`);
      } else {
        localStorage.removeItem('ekubank_emp_block');
      }
    }
  }, []);

  useEffect(() => {
    if (!bloqueado || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setBloqueado(false);
          setError('');
          localStorage.removeItem('ekubank_emp_block');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [bloqueado, countdown]);

  const handleCodigo = (e) => {
    const v = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (v.length <= 10) setCodigo(v);
  };

  const handlePassword = (e) => {
    const v = e.target.value.replace(/[^0-9]/g, '');
    if (v.length <= 6) setPassword(v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (bloqueado) { setError(`Acceso bloqueado. Espera ${Math.ceil(countdown / 60)} minuto(s).`); return; }
    if (codigo.length < 4) { setError('Ingresa tu código de empleado.'); return; }
    if (password.length < 6) { setError('La clave debe tener 6 dígitos.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('https://ekubank.ekubyte.net.pe/api/controllers/AuthController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: codigo, password, rol: 'asesor' }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('ekubank_emp_block');
        onLoginSuccess({ ...data.user, token: data.user.token });
      } else if (data.bloqueado) {
        const blockUntil = Date.now() + (data.segundos_restantes * 1000);
        localStorage.setItem('ekubank_emp_block', blockUntil.toString());
        setBloqueado(true);
        setCountdown(data.segundos_restantes);
        setError(data.message);
      } else {
        setError(data.message || 'Credenciales incorrectas.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen flex flex-col bg-[#0A1628] relative overflow-hidden">
      {/* ── ALERTA ENTORNO ACADÉMICO / SIMULACIÓN ── */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-[12px] font-bold shadow-sm relative z-50 flex items-center justify-center gap-2">
        <svg className="w-4.5 h-4.5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.52 13.064c-.377.162-.77.304-1.177.424A9.12 9.12 0 001 18.062c0 .937.121 1.848.349 2.718A12.011 12.011 0 0012 23c2.907 0 5.598-.87 7.854-2.36a11.97 11.97 0 00.347-2.718A9.12 9.12 0 0018.5 13.5c-.407-.12-.8-.262-1.177-.424" />
        </svg>
        <span>ATENCIÓN: Este sitio es una SIMULACIÓN ACADÉMICA de banca por internet para un proyecto de la Universidad. No es un banco real.</span>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(135deg,#0A1628_0%,#0D2137_50%,#0A1628_100%)]" />
        <div className="absolute top-[-200px] right-[-150px] w-[600px] h-[600px] rounded-full bg-[#004481]/8 blur-3xl" />
        <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#1973B8]/5 blur-3xl" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Top bar */}
      <header className="relative z-10 px-8 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <EkuBankLogo size={140} color="#ffffff" withDot />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-white/30 capitalize">{dateStr}</p>
            <p className="text-[13px] text-white/50 font-mono">{timeStr}</p>
          </div>
          <button onClick={onNavigateToHome}
            className="text-white/30 hover:text-white/70 text-[12px] font-medium transition-colors flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            Salir
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Card */}
          <div className="bg-[#111D2E]/80 backdrop-blur-xl rounded-[20px] border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#49D0A0]" />
                <span className="text-[10px] font-semibold text-[#49D0A0] uppercase tracking-[2px]">Portal interno</span>
              </div>
              <h1 className="text-[22px] font-bold text-white leading-tight">Acceso Colaboradores</h1>
              <p className="text-[13px] text-white/40 mt-1">Sistema de gestión financiera — FieldIQ</p>
            </div>

            {/* Form */}
            <div className="px-8 pt-6 pb-8">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-[10px] p-3 mb-5 text-[12px] font-medium text-red-400"
                  >{error}</motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-semibold text-white/40 tracking-[1.5px] uppercase mb-2">Código de empleado</label>
                  <input
                    type="text"
                    placeholder="Ej. EMP00123"
                    value={codigo}
                    onChange={handleCodigo}
                    required
                    className="w-full bg-white/[0.05] border border-white/[0.1] rounded-[10px] text-[14px] text-white px-4 h-[48px] placeholder:text-white/20 outline-none focus:border-[#1973B8] focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.15)] transition-all font-mono tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-white/40 tracking-[1.5px] uppercase mb-2">Clave de acceso (6 dígitos)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      inputMode="numeric"
                      placeholder="••••••"
                      value={password}
                      onChange={handlePassword}
                      required
                      maxLength={6}
                      className="w-full bg-white/[0.05] border border-white/[0.1] rounded-[10px] text-[18px] text-white px-4 pr-16 h-[48px] placeholder:text-white/20 outline-none focus:border-[#1973B8] focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.15)] transition-all font-mono tracking-[0.3em] text-center"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-white/30 uppercase tracking-[0.5px] px-1.5 py-1 rounded hover:text-white/60 transition-colors">
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </div>

                {bloqueado && countdown > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-[10px] p-3 text-[12px] font-medium text-amber-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Reintenta en <strong>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</strong></span>
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading || bloqueado}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-[48px] rounded-[10px] bg-[#004481] hover:bg-[#1565C0] text-white text-[13px] font-semibold tracking-[0.5px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-[#1973B8]/30"
                >
                  {isLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Verificando...</>
                  ) : bloqueado ? (
                    'Acceso bloqueado temporalmente'
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      Ingresar al sistema
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-[10px] text-white/20">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>Conexión cifrada TLS 1.3 · Sesión monitorizada</span>
                </div>
                <p className="text-[10px] text-white/15 mt-2">Uso exclusivo para colaboradores autorizados de EkuBank. El acceso no autorizado constituye una infracción sujeta a sanciones.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-3 border-t border-white/[0.04] flex justify-between items-center">
        <p className="text-[10px] text-white/15">EkuBank Continental S.A. · Gestión Interna v3.2.1</p>
        <p className="text-[10px] text-white/15">Soporte TI: ext. 4500</p>
      </footer>
    </div>
  );
};

export default LoginEmpleado;
