import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import EkuBankLogo from '../EkuBankLogo';

const Login = ({ onNavigateToHome, onNavigateToRegister, onLoginSuccess }) => {
  const [docType, setDocType] = useState('DNI');
  const [docNumber, setDocNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('ekubank_login_block');
    if (stored) {
      const until = parseInt(stored, 10);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setBloqueado(true);
        setCountdown(remaining);
        setError(`Cuenta bloqueada por seguridad. Espera ${Math.ceil(remaining / 60)} minuto(s).`);
      } else {
        localStorage.removeItem('ekubank_login_block');
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
          localStorage.removeItem('ekubank_login_block');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [bloqueado, countdown]);

  // Nueva función para manejar el cambio de tipo de documento
  const handleDocTypeChange = (e) => {
    setDocType(e.target.value);
    setDocNumber(''); // Limpiamos el input al cambiar de tipo
    setError('');
  };

  // Nueva función para validar lo que se escribe en tiempo real
  const handleDocNumberChange = (e) => {
    const value = e.target.value;
    
    if (docType === 'DNI') {
      // Si es DNI: Solo acepta números y máximo 8 dígitos
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 8) {
        setDocNumber(onlyNums);
      }
    } else if (docType === 'CE') {
      // Si es CE: Máximo 9 caracteres (letras y números)
      const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, '');
      if (alphanumeric.length <= 9) {
        setDocNumber(alphanumeric.toUpperCase()); // Convertimos a mayúsculas por estética
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (bloqueado) {
      setError(`Cuenta bloqueada. Espera ${Math.ceil(countdown / 60)} minuto(s).`);
      return;
    }

    if (docType === 'DNI' && docNumber.length < 8) {
      setError('El DNI debe tener 8 dígitos obligatoriamente.');
      return;
    }
    if (docType === 'CE' && docNumber.length < 9) {
      setError('El Carné de Extranjería debe tener 9 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = 'https://ekubank.ekubyte.net.pe/api/controllers/AuthController.php';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: docNumber, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('ekubank_login_block');
        onLoginSuccess({
          nombre: data.user.nombre,
          dni: data.user.dni,
          saldo: data.user.saldo,
          token: data.user.token,
        });
      } else if (data.bloqueado) {
        const blockUntil = Date.now() + (data.segundos_restantes * 1000);
        localStorage.setItem('ekubank_login_block', blockUntil.toString());
        setBloqueado(true);
        setCountdown(data.segundos_restantes);
        setError(data.message);
      } else {
        setError(data.message || 'Datos incorrectos. Verifica tu documento y contraseña.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor EkuBank (Base de datos).');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F2F4F7] flex flex-col relative overflow-hidden">
      {/* ── ALERTA ENTORNO ACADÉMICO / SIMULACIÓN ── */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-[12px] font-bold shadow-sm relative z-50 flex items-center justify-center gap-2">
        <svg className="w-4.5 h-4.5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.52 13.064c-.377.162-.77.304-1.177.424A9.12 9.12 0 001 18.062c0 .937.121 1.848.349 2.718A12.011 12.011 0 0012 23c2.907 0 5.598-.87 7.854-2.36a11.97 11.97 0 00.347-2.718A9.12 9.12 0 0018.5 13.5c-.407-.12-.8-.262-1.177-.424" />
        </svg>
        <span>ATENCIÓN: Este sitio es una SIMULACIÓN ACADÉMICA de banca por internet para un proyecto de la Universidad. No es un banco real.</span>
      </div>

      {/* Decorative background circles */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#004481] opacity-[0.06] pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-[#1973B8] opacity-[0.07] pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-[#004481] h-[60px] px-7 flex items-center justify-between relative z-10 shadow-md">
        <EkuBankLogo size={140} color="#ffffff" withDot />
        <button
          onClick={onNavigateToHome}
          className="text-white/70 text-[13px] font-medium hover:text-white transition-colors flex items-center gap-1.5"
        >
          Cerrar &nbsp;✕
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_40px_rgba(0,68,129,0.10),0_1px_4px_rgba(0,68,129,0.06)]">

            {/* Blue top banner */}
            <div className="relative overflow-hidden px-8 pt-7 pb-6"
              style={{ background: 'linear-gradient(135deg, #004481 0%, #1565C0 100%)' }}>
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
              <div className="absolute right-5 -bottom-14 w-28 h-28 rounded-full bg-white/[0.04]" />
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-white/65 text-[10.5px] font-semibold tracking-[1.5px] uppercase mb-1.5"
              >
                Bienvenido
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-white text-[26px] font-semibold leading-tight"
              >
                Hola, ingresa<br />a tu cuenta
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-white/60 text-[13px] font-light mt-1.5"
              >
                Banca online segura y rápida
              </motion.p>
            </div>

            {/* Form */}
            <div className="px-8 pt-7 pb-8">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border-l-[3px] border-red-500 rounded-r-lg text-red-700 p-3 mb-5 text-[12.5px] font-medium"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* DNI field */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-2">
                    Documento de identidad
                  </label>
                  <div className="flex items-center border-[1.5px] border-[#E0E6ED] rounded-[10px] overflow-hidden bg-[#F8FAFC] focus-within:border-[#1973B8] focus-within:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] focus-within:bg-white transition-all">
                    <select
                      value={docType}
                      onChange={handleDocTypeChange}
                      className="bg-transparent border-none border-r-[1.5px] border-[#E0E6ED] outline-none text-[13px] font-semibold text-[#004481] px-3 h-[46px] min-w-[64px] cursor-pointer appearance-none"
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">CE</option>
                    </select>
                    <input
                      type="text"
                      className="flex-1 border-none outline-none text-[14px] text-[#1A2B4A] bg-transparent px-3.5 h-[46px] placeholder:text-[#B0BEC5]"
                      placeholder={`Número de ${docType}`}
                      value={docNumber}
                      onChange={handleDocNumberChange}
                      required
                    />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-2">
                    Contraseña de banca
                  </label>
                  <div className="flex items-center border-[1.5px] border-[#E0E6ED] rounded-[10px] overflow-hidden bg-[#F8FAFC] focus-within:border-[#1973B8] focus-within:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] focus-within:bg-white transition-all relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      inputMode="numeric"
                      className="flex-1 border-none outline-none text-[18px] text-[#1A2B4A] bg-transparent pl-3.5 pr-16 h-[46px] tracking-[0.25em] font-mono text-center placeholder:font-sans placeholder:text-[14px] placeholder:tracking-normal placeholder:text-[#B0BEC5] placeholder:text-left"
                      placeholder="6 dígitos"
                      value={password}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^0-9]/g, '');
                        if (v.length <= 6) setPassword(v);
                      }}
                      maxLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[11px] font-semibold text-[#1973B8] uppercase tracking-[0.5px] px-1.5 py-1 rounded hover:bg-[#1973B8]/10 transition-colors"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </motion.div>

                {/* Submit */}
                {bloqueado && countdown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-amber-50 border-l-[3px] border-amber-500 rounded-r-lg p-3 text-[12.5px] font-medium text-amber-800 flex items-center gap-2"
                  >
                    <svg className="w-4.5 h-4.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Reintenta en <strong>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</strong></span>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading || bloqueado}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-[10px] bg-[#004481] hover:bg-[#1565C0] text-white text-[14px] font-semibold tracking-[0.5px] flex items-center justify-center gap-2 transition-colors disabled:opacity-65 disabled:cursor-not-allowed mt-2 overflow-hidden relative"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Consultando...
                    </>
                  ) : bloqueado ? (
                    'Acceso bloqueado temporalmente'
                  ) : (
                    'Entrar a mi cuenta'
                  )}
                </motion.button>
              </form>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-center mt-4 flex flex-col gap-2"
              >
                <a href="#" className="text-[#1973B8] text-[12.5px] font-medium hover:text-[#004481] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
                {/* NUEVO BOTÓN DE REGISTRO */}
                <button onClick={onNavigateToRegister} className="text-gray-600 text-[12.5px] font-bold hover:text-[#1973B8] transition-colors">
                  ¿No tienes cuenta? Regístrate aquí
                </button>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;