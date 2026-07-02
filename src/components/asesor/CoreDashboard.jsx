import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EkuBankLogo from '../EkuBankLogo';
import P1Resumen from '../core/P1_Resumen';
import P2Perfil from '../core/P2_Perfil';
import P3Negocio from '../core/P3_Negocio';
import P4Riesgo from '../core/P4_Riesgo';
import P5Creditos from '../core/P5_Creditos';

const tabs = [
  { key: 'P1', label: 'Resumen' },
  { key: 'P2', label: 'Perfil' },
  { key: 'P3', label: 'Negocio' },
  { key: 'P4', label: 'Riesgo SBS' },
  { key: 'P5', label: 'Créditos' },
];

const renderTabIcon = (key, className = "w-4 h-4") => {
  switch (key) {
    case 'P1':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case 'P2':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'P3':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'P4':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'P5':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return null;
  }
};

const CoreDashboard = ({ empleado, onLogout }) => {
  const [activeTab, setActiveTab] = useState('P1');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const fetchCore = useCallback(async () => {
    try {
      const res = await fetch('https://ekubank.ekubyte.net.pe/api/controllers/CoreController.php', {
        headers: { 'Authorization': `Bearer ${empleado?.token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error API:', err);
    } finally {
      setLoading(false);
    }
  }, [empleado?.token]);

  useEffect(() => {
    fetchCore();
    const interval = setInterval(fetchCore, 5000);
    return () => clearInterval(interval);
  }, [fetchCore]);

  const handleRefresh = useCallback(() => {
    fetchCore();
  }, [fetchCore]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-[3px] border-[#004481]/20 border-t-[#004481] rounded-full animate-spin" />
        <p className="text-[14px] font-semibold text-[#004481]">Cargando panel de análisis...</p>
        <p className="text-[11px] text-gray-400">Conectando con base de datos</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1A1A1A]">
      {/* ── ALERTA ENTORNO ACADÉMICO / SIMULACIÓN ── */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-[12px] font-bold shadow-sm relative z-50 flex items-center justify-center gap-2">
        <svg className="w-4.5 h-4.5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.52 13.064c-.377.162-.77.304-1.177.424A9.12 9.12 0 001 18.062c0 .937.121 1.848.349 2.718A12.011 12.011 0 0012 23c2.907 0 5.598-.87 7.854-2.36a11.97 11.97 0 00.347-2.718A9.12 9.12 0 0018.5 13.5c-.407-.12-.8-.262-1.177-.424" />
        </svg>
        <span>ATENCIÓN: Este sitio es una SIMULACIÓN ACADÉMICA de banca por internet para un proyecto de la Universidad. No es un banco real.</span>
      </div>

      {/* HEADER */}
      <header className="bg-white border-b border-[#EAECF0] shadow-sm">
        <div className="max-w-[1500px] mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <EkuBankLogo size={140} color="#004481" withDot />
            <div className="h-5 w-px bg-gray-200" />
            <div>
              <p className="text-[13px] font-semibold text-[#072146]">FieldIQ — Panel de Control</p>
              <p className="text-[10px] text-gray-400">Análisis financiero y riesgos · bd_core_financiero</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold bg-[#EEF3FB] text-[#004481] px-3 py-1 rounded-full border border-[#004481]/10">
              {(empleado?.rol === 'administrador' || empleado?.rol === 'admin') ? 'Modo Administrador' : 'Modo Evaluador'}
            </span>
            {empleado && (
              <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">
                {empleado.nombre}
              </span>
            )}
            <span className="text-[10px] text-gray-400">{new Date().toLocaleDateString('es-PE')}</span>
            <button onClick={onLogout}
              className="bg-[#F7F8FA] hover:bg-red-50 hover:text-red-600 text-gray-600 text-[12px] font-semibold px-3.5 py-1.5 rounded-lg transition-colors border border-[#EAECF0]">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className="bg-white border-b border-[#EAECF0]">
        <div className="max-w-[1500px] mx-auto px-6 flex gap-1 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative px-5 py-3 text-[12px] font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === key ? 'text-[#004481]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {renderTabIcon(key, activeTab === key ? "w-4 h-4 text-[#004481]" : "w-4 h-4 text-gray-400")}
              {key} — {label}
              {activeTab === key && (
                <motion.div layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#004481] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <main className="max-w-[1500px] mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>
            {activeTab === 'P1' && <P1Resumen apiData={data} />}
            {activeTab === 'P2' && <P2Perfil apiData={data} />}
            {activeTab === 'P3' && <P3Negocio apiData={data} />}
            {activeTab === 'P4' && <P4Riesgo apiData={data} />}
            {activeTab === 'P5' && <P5Creditos apiData={data} empleado={empleado} onRefreshData={handleRefresh} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CoreDashboard;
