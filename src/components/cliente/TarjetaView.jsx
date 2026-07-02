import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import EkuBankLogo from '../EkuBankLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const TarjetaView = ({ mode = 'info', onNavigateToHome, onNavigateToLogin }) => {
  const [currentMode, setCurrentMode] = useState(mode); // 'info' or 'solicitud'
  const [activeTab, setActiveTab] = useState('beneficios'); // 'beneficios', 'requisitos', 'tasas'
  const [spending, setSpending] = useState(2000); // Para la calculadora interactiva
  
  // Estados para el flujo de solicitud
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    docType: 'DNI',
    docNumber: '',
    cellphone: '',
    laborType: 'Dependiente',
    income: '',
    fullName: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [evaluatingMessage, setEvaluatingMessage] = useState('');
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [approvedCard, setApprovedCard] = useState(null);

  // Efecto cuando cambia el modo principal por props
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Manejar el cambio de datos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormErrors(prev => ({ ...prev, [name]: '' }));
    
    if (name === 'docNumber') {
      const filtered = formData.docType === 'DNI' 
        ? value.replace(/[^0-9]/g, '').slice(0, 8)
        : value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 9);
      setFormData(prev => ({ ...prev, [name]: filtered }));
    } else if (name === 'cellphone') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '').slice(0, 9) }));
    } else if (name === 'income') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/[^0-9]/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validar Paso 1
  const validateStep1 = () => {
    const errors = {};
    if (formData.docType === 'DNI' && formData.docNumber.length !== 8) {
      errors.docNumber = 'El DNI debe tener 8 dígitos.';
    }
    if (formData.docType === 'CE' && formData.docNumber.length < 8) {
      errors.docNumber = 'El CE debe tener entre 8 y 9 caracteres.';
    }
    if (formData.cellphone.length !== 9 || !formData.cellphone.startsWith('9')) {
      errors.cellphone = 'Ingresa un celular válido de 9 dígitos (empieza con 9).';
    }
    if (!formData.fullName.trim()) {
      errors.fullName = 'Ingresa tu nombre completo.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validar Paso 2
  const validateStep2 = () => {
    const errors = {};
    if (!formData.income || Number(formData.income) <= 0) {
      errors.income = 'Ingresa tu ingreso mensual neto.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
      runEvaluationSimulation();
    }
  };

  // Simulación de evaluación
  const runEvaluationSimulation = () => {
    const messages = [
      'Validando identidad con RENIEC...',
      'Verificando historial crediticio en Sentinel y Equifax...',
      'Evaluando capacidad de endeudamiento...',
      'Calculando línea de crédito óptima...',
      'Finalizando evaluación de riesgo...',
    ];

    let currentMsgIndex = 0;
    setEvaluatingMessage(messages[0]);
    setEvaluationProgress(0);

    const interval = setInterval(() => {
      currentMsgIndex += 1;
      if (currentMsgIndex < messages.length) {
        setEvaluatingMessage(messages[currentMsgIndex]);
        setEvaluationProgress((currentMsgIndex / messages.length) * 100);
      } else {
        clearInterval(interval);
        setEvaluationProgress(100);
        setTimeout(() => {
          evaluateCredit();
        }, 800);
      }
    }, 900);
  };

  // Procesar resultado de crédito
  const evaluateCredit = () => {
    const incomeNum = Number(formData.income);
    if (incomeNum < 1200) {
      setApprovedCard({
        approved: false,
        reason: 'Lo sentimos, para calificar a una tarjeta de crédito EkuBank se requiere un ingreso mínimo de S/ 1,200 mensuales.',
      });
    } else {
      // Calcular límite: 2.5 veces el sueldo, redondeado a múltiplos de 500
      let limit = Math.round((incomeNum * 2.5) / 500) * 500;
      if (limit < 2000) limit = 2000;
      
      let cardName = 'Visa Gold';
      let cardColor = 'from-[#B89742] via-[#E2C785] to-[#B89742]';
      let accentColor = '#B89742';

      if (incomeNum >= 3500 && incomeNum < 7000) {
        cardName = 'Visa Platinum';
        cardColor = 'from-[#5E6872] via-[#B3B9C1] to-[#5E6872]';
        accentColor = '#B3B9C1';
      } else if (incomeNum >= 7000) {
        cardName = 'Visa Signature';
        cardColor = 'from-[#1A1A2E] via-[#0F3460] to-[#16213E] border-[#C9A84C]/40 border';
        accentColor = '#C9A84C';
      }

      setApprovedCard({
        approved: true,
        cardName,
        cardColor,
        accentColor,
        limit,
      });
    }
    setStep(4);
  };

  // Lógica de recompensas dinámica
  const getPoints = () => Math.round(spending * 12 * 1.5); // 1.5 puntos por cada S/ gastado
  
  const renderRewardIcon = (key, className = "w-5 h-5 text-[#0f7a5b]") => {
    switch (key) {
      case 'cine':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/>
            <line x1="17" y1="17" x2="22" y2="17"/>
            <line x1="17" y1="7" x2="22" y2="7"/>
          </svg>
        );
      case 'cena':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 18V6M6 6v6a2 2 0 0 0 4 0V6M14 6v8h4V6" />
          </svg>
        );
      case 'giftcard':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        );
      case 'vuelo':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-2-2h-3l-4-4H9l2 4H7L5 4H3v2l2 2h2l2 4H7l-2 1H3v2l3-1h13a2 2 0 0 0 2-2z" />
          </svg>
        );
      case 'viaje':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getRewardTier = () => {
    const pts = getPoints();
    if (pts < 5000) return { title: '1 Entrada de Cine 2D + Combo', cost: '1,500 pts', iconKey: 'cine' };
    if (pts < 15000) return { title: 'Cena Gourmet para Dos Personas', cost: '8,000 pts', iconKey: 'cena' };
    if (pts < 35000) return { title: 'Gift Card de S/ 200 en Tiendas', cost: '18,000 pts', iconKey: 'giftcard' };
    if (pts < 75000) return { title: 'Vuelo Nacional de Ida y Vuelta (Cusco/Arequipa)', cost: '35,000 pts', iconKey: 'vuelo' };
    return { title: 'Paquete de Viaje Internacional de Fin de Semana', cost: '80,000 pts', iconKey: 'viaje' };
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-[#F8FAFC] flex flex-col relative overflow-hidden">
      {/* ── ALERTA ENTORNO ACADÉMICO / SIMULACIÓN ── */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-[12px] font-bold shadow-sm relative z-50 flex items-center justify-center gap-2">
        <svg className="w-4.5 h-4.5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.52 13.064c-.377.162-.77.304-1.177.424A9.12 9.12 0 001 18.062c0 .937.121 1.848.349 2.718A12.011 12.011 0 0012 23c2.907 0 5.598-.87 7.854-2.36a11.97 11.97 0 00.347-2.718A9.12 9.12 0 0018.5 13.5c-.407-.12-.8-.262-1.177-.424" />
        </svg>
        <span>ATENCIÓN: Este sitio es una SIMULACIÓN ACADÉMICA de banca por internet para un proyecto de la Universidad. No es un banco real.</span>
      </div>

      {/* Círculos decorativos */}
      <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-[#004481] opacity-[0.04] pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-[#1973B8] opacity-[0.05] pointer-events-none" />

      {/* Header */}
      <header className="w-full bg-[#004481] h-[64px] px-6 flex items-center justify-between relative z-10 shadow-md">
        <div className="flex items-center gap-6 cursor-pointer" onClick={onNavigateToHome}>
          <EkuBankLogo size={140} color="#ffffff" withDot />
        </div>
        <button
          onClick={onNavigateToHome}
          className="text-white/80 text-[13px] font-semibold hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Salir
        </button>
      </header>

      {/* Navegación Secundaria / Sub-Navbar */}
      <div className="bg-white border-b border-gray-200 py-3 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentMode('info')}
              className={`text-[13px] font-bold pb-1 transition-all border-b-2 ${
                currentMode === 'info' ? 'border-[#004481] text-[#004481]' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Conoce la Tarjeta
            </button>
            <button
              onClick={() => {
                setCurrentMode('solicitud');
                setStep(1);
                setApprovedCard(null);
              }}
              className={`text-[13px] font-bold pb-1 transition-all border-b-2 ${
                currentMode === 'solicitud' ? 'border-[#004481] text-[#004481]' : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              Solicitar Online
            </button>
          </div>
          <button
            onClick={() => setCurrentMode('solicitud')}
            className="hidden sm:inline-flex bg-[#49D0A0] text-[#072146] hover:bg-[#3bc292] text-[12.5px] font-bold px-4 py-2 rounded-lg transition-all"
          >
            Pídela en 3 minutos
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-10 relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentMode === 'info' ? (
            /* =========================================================================
               VISTA DE INFORMACIÓN DE TARJETA
               ========================================================================= */
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
            >
              {/* Contenido Izquierda */}
              <div className="lg:col-span-7 space-y-6">
                <span className="bg-[#49D0A0]/10 text-[#0f7a5b] text-[11px] font-bold tracking-[1.5px] uppercase px-3 py-1.5 rounded-full inline-block">
                  Campaña Visa Mundial FIFA 2026
                </span>
                <h1 className="text-[34px] md:text-[46px] font-bold text-[#072146] leading-[1.1] tracking-tight">
                  La tarjeta que te lleva al <span className="text-[#004481] bg-gradient-to-r from-[#004481] to-[#1565C0] bg-clip-text text-transparent">Mundial FIFA 2026</span>
                </h1>
                <p className="text-gray-500 text-[15px] max-w-[580px] leading-relaxed">
                  Por compras con tu Tarjeta EkuBank Visa, acumula opciones adicionales para el sorteo de paquetes de viaje dobles todo pagado, pantallas LED, consolas de juego y miles de premios exclusivos.
                </p>

                {/* Tabs dinámicos */}
                <div className="border-b border-gray-200 flex gap-6 pt-4">
                  {['beneficios', 'requisitos', 'tasas'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[14px] font-bold pb-2 capitalize transition-colors ${
                        activeTab === tab ? 'text-[#004481] border-b-2 border-[#004481]' : 'text-gray-400 hover:text-[#072146]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Contenido del Tab */}
                <div className="min-h-[140px] pt-2">
                  {activeTab === 'beneficios' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-[#004481] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
                        </svg>
                        <div>
                          <p className="font-bold text-[#072146] text-[14px]">Sorteo FIFA 2026</p>
                          <p className="text-[12px] text-gray-500">1 opción adicional por cada S/ 100 de compra en cualquier rubro.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-[#004481] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                        <div>
                          <p className="font-bold text-[#072146] text-[14px]">0% Interés</p>
                          <p className="text-[12px] text-gray-500">Compra hasta en 12 cuotas sin intereses en más de 5,000 comercios.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-[#004481] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        <div>
                           <p className="font-bold text-[#072146] text-[14px]">EkuPuntos</p>
                          <p className="text-[12px] text-gray-500">Gana 1.5 puntos por cada dólar (o equivalente) gastado.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-[#004481] shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <div>
                          <p className="font-bold text-[#072146] text-[14px]">Comisión Zero</p>
                          <p className="text-[12px] text-gray-500">Exoneración del 100% de la membresía anual realizando un consumo mensual.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'requisitos' && (
                    <ul className="space-y-2.5 text-[13.5px] text-gray-600 pl-4 list-disc">
                      <li>Ingreso mínimo mensual neto de <strong>S/ 1,200</strong> (independiente o dependiente).</li>
                      <li>Tener entre 18 y 75 años de edad.</li>
                      <li>Copia de documento de identidad (DNI o Carné de Extranjería).</li>
                      <li>Buen historial crediticio reportado en centrales de riesgo.</li>
                      <li>Último recibo de servicios (luz, agua o teléfono).</li>
                    </ul>
                  )}

                  {activeTab === 'tasas' && (
                    <div className="space-y-3 text-[13px] text-gray-600">
                      <p><strong>Tasa de Interés Efectiva Anual (TEA):</strong> Desde 29.99% hasta 79.90% sujeto a evaluación.</p>
                      <p><strong>Membresía Anual:</strong> S/ 80 (Visa Gold) o S/ 150 (Visa Platinum). ¡Gratis si consumes mensualmente sin monto mínimo!</p>
                      <p><strong>Tasa de Costo Efectivo Anual (TCEA):</strong> Incluye seguro de desgravamen de 0.285% mensual del saldo deudor.</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setCurrentMode('solicitud');
                      setStep(1);
                      setApprovedCard(null);
                    }}
                    className="bg-[#004481] text-white hover:bg-[#1565C0] text-[14px] font-bold px-7 py-3.5 rounded-[12px] shadow-lg shadow-[#004481]/10 transition-all hover:scale-[1.02]"
                  >
                    Solicítala aquí
                  </button>
                  <button
                    onClick={onNavigateToHome}
                    className="border border-[#E0E6ED] text-gray-600 hover:bg-gray-50 text-[14px] font-semibold px-6 py-3.5 rounded-[12px] transition-all"
                  >
                    Regresar al Inicio
                  </button>
                </div>
              </div>

              {/* Contenedor Derecha (Card Interactiva + Calculadora) */}
              <div className="lg:col-span-5 space-y-8">
                {/* 3D-Like Credit Card */}
                <div className="flex justify-center">
                  <motion.div
                    whileHover={{ scale: 1.04, rotateY: 10, rotateX: -5 }}
                    style={{ perspective: 1000 }}
                    className="w-[360px] h-[225px] rounded-[24px] bg-gradient-to-br from-[#002b5c] via-[#004481] to-[#1a64b2] p-7 text-white shadow-[0_20px_50px_rgba(0,68,129,0.25)] relative overflow-hidden border border-white/10 cursor-pointer"
                  >
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/[0.03] pointer-events-none" />
                    <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#49D0A0]/10 pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-10">
                      <span className="text-[20px] font-black tracking-[2.5px] font-sans">EkuBank</span>
                      <span className="bg-white/15 backdrop-blur-sm text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white">
                        Visa Signature
                      </span>
                    </div>

                    <div className="w-11 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500/80 rounded-[5px] mb-5 border border-yellow-200/50 flex items-center justify-center relative shadow-inner">
                      <div className="grid grid-cols-3 w-8 h-6 gap-0.5 opacity-40">
                        <div className="border border-black/20" /><div className="border border-black/20" /><div className="border border-black/20" />
                        <div className="border border-black/20" /><div className="border border-black/20" /><div className="border border-black/20" />
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[14px] font-mono tracking-[3px] text-white/90">•••• •••• •••• 5684</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-[1.5px] mt-2.5">Tu Nombre Aquí</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#ea1b25]/85" />
                        <div className="w-7 h-7 rounded-full bg-[#f89e1b]/75 -ml-3" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Calculadora Interactiva */}
                <div className="bg-white rounded-[20px] border border-gray-100 p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[#072146] font-bold text-[14px]">Calculadora de EkuPuntos</p>
                    <span className="bg-[#EEF3FB] text-[#004481] text-[11px] font-bold px-2.5 py-1 rounded-full">Estimado Anual</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[12.5px]">
                      <span className="text-gray-500 font-medium">Consumo mensual estimado</span>
                      <span className="text-[#004481] font-bold">S/ {spending.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="15000"
                      step="500"
                      value={spending}
                      onChange={(e) => setSpending(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#004481]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.5px]">Puntos al año</p>
                      <div className="overflow-hidden h-[30px] flex items-center">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={getPoints()}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="text-[20px] font-black text-[#004481]"
                          >
                            {getPoints().toLocaleString()}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.5px]">Redime al instante</p>
                      <div className="overflow-hidden h-[30px] flex items-center">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={getRewardTier().title}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.2 }}
                            className="text-[12.5px] font-bold text-[#0f7a5b] flex items-center gap-1.5"
                          >
                            {renderRewardIcon(getRewardTier().iconKey)}
                            <span className="truncate max-w-[140px]" title={getRewardTier().title}>{getRewardTier().title}</span>
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* =========================================================================
               VISTA DE SOLICITUD / FORMULARIO MULTIPASOS
               ========================================================================= */
            <motion.div
              key="solicitud"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-[560px] mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-fade-in"
            >
              {/* Encabezado del Formulario */}
              <div className="bg-gradient-to-r from-[#004481] to-[#1565C0] px-8 py-6 text-white relative">
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mt-6 -mr-6" />
                <h2 className="text-[20px] font-bold">Solicitud de Tarjeta de Crédito</h2>
                <p className="text-[12px] text-white/70">Aprobación en tiempo real en solo unos pasos</p>
                
                {/* Indicador de pasos */}
                {step <= 3 && (
                  <div className="flex items-center gap-2 mt-4 pt-2">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex-1 flex items-center gap-1.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            step === s
                              ? 'bg-[#49D0A0] text-[#072146] scale-110 shadow-lg shadow-[#49D0A0]/20'
                              : step > s
                              ? 'bg-white/30 text-white'
                              : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {step > s ? '✓' : s}
                        </div>
                        <div className="text-[10px] font-medium hidden sm:inline-block">
                          {s === 1 ? 'Identificación' : s === 2 ? 'Ingreso y Empleo' : 'Evaluación'}
                        </div>
                        {s < 3 && <div className="h-[2px] flex-1 bg-white/20" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CUERPO DEL FORMULARIO CON TRANSICIONES */}
              <div className="p-8">
                {step === 1 && (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleStep1Submit}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-[#004481] tracking-[0.8px] uppercase mb-1.5">
                        Tu Nombre Completo
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 focus:border-[#004481] focus:ring-1 focus:ring-[#004481] rounded-xl px-4 py-3 text-[13.5px] outline-none transition-all"
                        placeholder="Ej. Juan Pérez García"
                        required
                      />
                      {formErrors.fullName && <p className="text-red-500 text-[11px] mt-1">{formErrors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[11px] font-bold text-[#004481] tracking-[0.8px] uppercase mb-1.5">
                          Doc
                        </label>
                        <select
                          name="docType"
                          value={formData.docType}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, docType: e.target.value, docNumber: '' }));
                            setFormErrors(prev => ({ ...prev, docNumber: '' }));
                          }}
                          className="w-full border border-gray-200 focus:border-[#004481] focus:ring-1 focus:ring-[#004481] rounded-xl px-3 py-3 text-[13.5px] outline-none bg-white cursor-pointer h-[48px]"
                        >
                          <option value="DNI">DNI</option>
                          <option value="CE">CE</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[11px] font-bold text-[#004481] tracking-[0.8px] uppercase mb-1.5">
                          Número de documento
                        </label>
                        <input
                          type="text"
                          name="docNumber"
                          value={formData.docNumber}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 focus:border-[#004481] focus:ring-1 focus:ring-[#004481] rounded-xl px-4 py-3 text-[13.5px] outline-none transition-all h-[48px]"
                          placeholder={`Número de ${formData.docType}`}
                          required
                        />
                      </div>
                    </div>
                    {formErrors.docNumber && <p className="text-red-500 text-[11px]">{formErrors.docNumber}</p>}

                    <div>
                      <label className="block text-[11px] font-bold text-[#004481] tracking-[0.8px] uppercase mb-1.5">
                        Número de Celular
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400 text-[13.5px] border-r pr-2 border-gray-200">+51</span>
                        <input
                          type="text"
                          name="cellphone"
                          value={formData.cellphone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 focus:border-[#004481] focus:ring-1 focus:ring-[#004481] rounded-xl pl-16 pr-4 py-3 text-[13.5px] outline-none transition-all"
                          placeholder="9XXXXXXXX"
                          required
                        />
                      </div>
                      {formErrors.cellphone && <p className="text-red-500 text-[11px] mt-1">{formErrors.cellphone}</p>}
                    </div>

                    <button
                      type="submit"
                      className="w-full h-12 bg-[#004481] hover:bg-[#1565C0] text-white text-[14px] font-bold rounded-xl flex items-center justify-center transition-all mt-4"
                    >
                      Continuar Solicitud
                    </button>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleStep2Submit}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-[#004481] tracking-[0.8px] uppercase mb-1.5">
                        Situación Laboral
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Dependiente', 'Independiente'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, laborType: type }))}
                            className={`py-3 px-4 rounded-xl text-[13px] font-bold transition-all border ${
                              formData.laborType === type
                                ? 'bg-[#EEF3FB] border-[#004481] text-[#004481]'
                                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#004481] tracking-[0.8px] uppercase mb-1.5">
                        Ingreso Mensual Neto (S/)
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-gray-400 text-[13.5px]">S/</span>
                        <input
                          type="text"
                          name="income"
                          value={formData.income}
                          onChange={handleInputChange}
                          className="w-full border border-gray-200 focus:border-[#004481] focus:ring-1 focus:ring-[#004481] rounded-xl pl-9 pr-4 py-3 text-[13.5px] outline-none transition-all font-semibold text-[#072146]"
                          placeholder="Ingreso neto mensual"
                          required
                        />
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1">Sueldo neto aproximado luego de impuestos.</p>
                      {formErrors.income && <p className="text-red-500 text-[11px] mt-1">{formErrors.income}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#004481] tracking-[0.8px] uppercase mb-1.5">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 focus:border-[#004481] focus:ring-1 focus:ring-[#004481] rounded-xl px-4 py-3 text-[13.5px] outline-none transition-all"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                      {formErrors.email && <p className="text-red-500 text-[11px] mt-1">{formErrors.email}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-[100px] border border-gray-200 hover:bg-gray-50 text-[13.5px] font-semibold text-gray-600 rounded-xl"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        className="flex-1 h-12 bg-[#004481] hover:bg-[#1565C0] text-white text-[14px] font-bold rounded-xl flex items-center justify-center transition-all"
                      >
                        Evaluar mi Tarjeta
                      </button>
                    </div>
                  </motion.form>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
                  >
                    {/* Spinning Evaluation Ring */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                      <div
                        className="absolute inset-0 rounded-full border-4 border-[#004481] border-t-transparent animate-spin"
                        style={{ animationDuration: '1.2s' }}
                      />
                      <svg className="w-8 h-8 text-[#004481]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[#072146] font-bold text-[16px]">
                        Evaluando Solicitud
                      </p>
                      <p className="text-gray-400 text-[12px] h-[36px] max-w-[280px] mx-auto transition-all">
                        {evaluatingMessage}
                      </p>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#49D0A0] transition-all duration-300"
                        style={{ width: `${evaluationProgress}%` }}
                      />
                    </div>
                  </motion.div>
                )}

                {step === 4 && approvedCard && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {approvedCard.approved ? (
                      /* APROBADO */
                      <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-full shadow-md">
                          <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-[22px] font-black text-[#0f7a5b]">¡Felicidades, {formData.fullName.split(' ')[0]}!</h3>
                          <p className="text-[13.5px] text-gray-500">
                            Tu crédito ha sido aprobado exitosamente. Tu tarjeta está lista.
                          </p>
                        </div>

                        {/* Tarjeta aprobada con línea de crédito */}
                        <div className="flex justify-center pt-2">
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`w-[320px] h-[200px] rounded-2xl bg-gradient-to-br ${approvedCard.cardColor} p-6 text-white text-left relative overflow-hidden shadow-2xl`}
                          >
                            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/[0.04]" />
                            <div className="flex justify-between items-start mb-6">
                              <span className="text-[16px] font-bold tracking-[1.5px]">EkuBank</span>
                              <span className="bg-white/20 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {approvedCard.cardName}
                              </span>
                            </div>
                            <p className="text-[11px] text-white/50 uppercase tracking-[1px] mb-0.5">Línea de crédito aprobada</p>
                            <p className="text-[28px] font-black tracking-tight mb-2">
                              S/ {approvedCard.limit.toLocaleString()}
                            </p>
                            <div className="flex justify-between items-end mt-4">
                              <div>
                                <p className="text-[11px] font-mono tracking-[2px] text-white/80">•••• •••• •••• 9924</p>
                                <p className="text-[9px] text-white/40 uppercase tracking-[1px] mt-1">{formData.fullName}</p>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
                                Visa
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        <div className="bg-[#E6F7F0] text-[#0f7a5b] text-[12.5px] rounded-xl p-4 font-medium flex items-center gap-2 max-w-[420px] mx-auto text-left">
                          <svg className="w-5 h-5 text-[#0f7a5b] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 12 20 22 4 22 4 12" />
                            <rect x="2" y="7" width="20" height="5" />
                            <line x1="12" y1="22" x2="12" y2="7" />
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                          </svg>
                          <p>¡Ganaste <strong>5 opciones de regalo</strong> para el sorteo del Mundial FIFA 2026 de forma automática!</p>
                        </div>

                        <div className="space-y-3 pt-2">
                          <button
                            onClick={onNavigateToLogin}
                            className="w-full h-12 bg-[#004481] hover:bg-[#1565C0] text-white text-[14px] font-bold rounded-xl flex items-center justify-center transition-all animate-pulse"
                          >
                            Ir a activar a mi Banca Online
                          </button>
                          <p className="text-gray-400 text-[11px]">
                            Para concretar el envío a domicilio y firma digital de contrato, inicia sesión.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* DENEGADO */
                      <div className="text-center space-y-6 py-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-full shadow-md">
                          <svg className="w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </div>
                        <div className="space-y-2 max-w-[380px] mx-auto">
                          <h3 className="text-[20px] font-bold text-[#072146]">Evaluación No Favorable</h3>
                          <p className="text-[13.5px] text-gray-500 leading-relaxed">
                            {approvedCard.reason}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 max-w-[340px] mx-auto pt-4">
                          <button
                            onClick={() => {
                              setCurrentMode('info');
                              setStep(1);
                            }}
                            className="bg-[#004481] text-white hover:bg-[#1565C0] h-11 text-[13.5px] font-bold rounded-xl transition-all"
                          >
                            Ver Requisitos de Tarjeta
                          </button>
                          <button
                            onClick={onNavigateToHome}
                            className="border border-gray-200 hover:bg-gray-50 h-11 text-[13.5px] font-semibold text-gray-500 rounded-xl transition-all"
                          >
                            Volver al Inicio
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-6 px-6 relative z-10 text-center text-[12px] text-gray-400 font-medium">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <EkuBankLogo size={115} color="#004481" withDot />
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#004481] transition-colors">Políticas de Privacidad</a>
            <a href="#" className="hover:text-[#004481] transition-colors">Términos del Sorteo</a>
            <a href="#" className="hover:text-[#004481] transition-colors">Ayuda</a>
          </div>
          <p className="text-[11px] text-gray-300">Proyecto académico · Ekubyte 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default TarjetaView;
