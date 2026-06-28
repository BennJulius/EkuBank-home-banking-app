import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EkuBankLogo from '../EkuBankLogo';
import P1Resumen from '../core/P1_Resumen';
import P2Perfil from '../core/P2_Perfil';
import P3Negocio from '../core/P3_Negocio';
import P4Riesgo from '../core/P4_Riesgo';
import P5Creditos from '../core/P5_Creditos';

const tabs = [
  { key: 'P1', label: 'Resumen', icon: '📊' },
  { key: 'P2', label: 'Perfil', icon: '👤' },
  { key: 'P3', label: 'Negocio', icon: '🏪' },
  { key: 'P4', label: 'Riesgo SBS', icon: '⚠️' },
  { key: 'P5', label: 'Créditos', icon: '💰' },
];

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
        <span>🎓</span>
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
          {tabs.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative px-5 py-3 text-[12px] font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === key ? 'text-[#004481]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-[14px]">{icon}</span>
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
