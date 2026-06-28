import { motion } from 'framer-motion';
import { useState } from 'react';
import EkuBankLogo from '../EkuBankLogo';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

const Home = ({ onNavigateToLogin, onNavigateToEmpleado, onNavigateToTarjetaInfo, onNavigateToTarjetaSolicitud }) => {
  const [activeSection, setActiveSection] = useState('personas');

  return (
    <div className="min-h-screen bg-white text-[#072146]">
      {/* ── ALERTA ENTORNO ACADÉMICO / SIMULACIÓN ── */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-[12.5px] font-bold shadow-sm relative z-50 flex items-center justify-center gap-2">
        <span>🎓</span>
        <span>ATENCIÓN: Este sitio es una SIMULACIÓN ACADÉMICA de banca por internet para un proyecto de la Universidad. No es un banco real.</span>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <EkuBankLogo size={140} color="#004481" withDot />
            <div className="hidden md:flex items-center gap-6 text-[13px] font-semibold">
              {['personas', 'empresas', 'privada'].map((sec) => (
                <button key={sec} onClick={() => setActiveSection(sec)}
                  className={`capitalize transition-colors pb-0.5 ${
                    activeSection === sec
                      ? 'text-[#072146] border-b-2 border-[#004481]'
                      : 'text-gray-400 hover:text-[#072146]'
                  }`}>{sec}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={onNavigateToLogin}
              className="bg-[#004481] text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold hover:bg-[#1565C0] transition-all hover:shadow-lg hover:shadow-[#004481]/20">
              Banca por Internet
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO DINÁMICO ── */}
      {activeSection === 'personas' && (
        <HeroPersonas
          onNavigateToLogin={onNavigateToLogin}
          onNavigateToTarjetaInfo={onNavigateToTarjetaInfo}
          onNavigateToTarjetaSolicitud={onNavigateToTarjetaSolicitud}
        />
      )}
      {activeSection === 'empresas' && <HeroEmpresas onNavigateToLogin={onNavigateToLogin} />}
      {activeSection === 'privada' && <HeroPrivada onNavigateToLogin={onNavigateToLogin} />}

      {/* ── FEATURES ── */}
      {activeSection === 'personas' && <FeaturesPersonas />}
      {activeSection === 'empresas' && <FeaturesEmpresas />}
      {activeSection === 'privada' && <FeaturesPrivada />}

      {/* ── CTA BANNER ── */}
      <section className="py-16 px-6">
        <div className="max-w-[1000px] mx-auto bg-gradient-to-r from-[#004481] to-[#1565C0] rounded-[24px] p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#49D0A0]/10" />
          <div className="relative z-10">
            <h3 className="text-[24px] md:text-[30px] font-bold text-white mb-3">¿Listo para empezar?</h3>
            <p className="text-white/60 text-[14px] mb-7 max-w-[400px] mx-auto">Abre tu cuenta en minutos, 100% digital y sin costo de mantenimiento.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={onNavigateToLogin}
                className="bg-white text-[#004481] px-8 py-3.5 rounded-[12px] text-[14px] font-bold hover:bg-[#F0F5FB] transition-all hover:shadow-lg">
                Iniciar sesión
              </button>
              <button onClick={onNavigateToLogin}
                className="bg-white/10 border border-white/20 text-white px-8 py-3.5 rounded-[12px] text-[14px] font-semibold hover:bg-white/20 transition-all">
                Crear cuenta gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <EkuBankLogo size={115} color="#004481" withDot />
          <div className="flex gap-6 text-[12px] text-gray-400 font-medium">
            <a href="#" className="hover:text-[#004481] transition-colors">Términos y condiciones</a>
            <a href="#" className="hover:text-[#004481] transition-colors">Privacidad</a>
            <a href="#" className="hover:text-[#004481] transition-colors">Ayuda</a>
            <button onClick={onNavigateToEmpleado} className="hover:text-[#004481] transition-colors">Acceso colaboradores</button>
          </div>
          <p className="text-[11px] text-gray-300">Proyecto académico · Ekubyte 2025</p>
        </div>
      </footer>
    </div>
  );
};

// ══════════════════════════════════════════════
// HEROES
// ══════════════════════════════════════════════

const HeroPersonas = ({ onNavigateToLogin, onNavigateToTarjetaInfo, onNavigateToTarjetaSolicitud }) => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#001E3C] via-[#004481] to-[#1565C0] animate-gradient" />
    <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full bg-[#1973B8]/20 blur-3xl" />
    <div className="absolute bottom-[-100px] left-[-60px] w-[400px] h-[400px] rounded-full bg-[#49D0A0]/10 blur-3xl" />
    <div className="absolute top-20 right-[20%] w-[200px] h-[200px] rounded-full border border-white/[0.06]" />

    <div className="relative max-w-[1200px] mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
      <div className="md:w-[55%] text-center md:text-left">
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#49D0A0] animate-pulse" />
          <span className="text-white/80 text-[12px] font-medium tracking-wide">Tarjeta de Crédito EkuBank x Visa</span>
        </motion.div>
        <motion.h1 {...fadeUp(0.1)} className="text-[40px] md:text-[54px] font-bold text-white leading-[1.08] tracking-tight mb-5">
          ¡Queremos verte<br />en la{' '}
          <span className="relative"><span className="text-[#49D0A0]">tribuna!</span>
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 6C50 2 150 2 198 6" stroke="#49D0A0" strokeWidth="3" strokeLinecap="round" opacity="0.4"/></svg>
          </span>
        </motion.h1>
        <motion.p {...fadeUp(0.15)} className="text-[15px] text-white/60 leading-relaxed mb-8 max-w-[480px] md:mx-0 mx-auto">
          Gana uno de los dos paquetes dobles a la Copa Mundial de la FIFA 2026, gracias a Visa.
          Sorteamos consolas, televisores, parrillas y cientos de premios más.
        </motion.p>
        <motion.div {...fadeUp(0.2)} className="flex gap-3 flex-wrap justify-center md:justify-start">
          <button onClick={onNavigateToTarjetaSolicitud} className="bg-white text-[#004481] px-7 py-3.5 rounded-[12px] text-[14px] font-bold hover:bg-[#F0F5FB] transition-all hover:shadow-lg hover:shadow-white/10">
            Solicítala aquí
          </button>
          <button onClick={onNavigateToTarjetaInfo} className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-7 py-3.5 rounded-[12px] text-[14px] font-semibold hover:bg-white/20 transition-all">
            Conoce más
          </button>
        </motion.div>
        <motion.div {...fadeUp(0.25)} className="flex gap-8 mt-10 justify-center md:justify-start">
          {[{ n: '2.5M+', l: 'Clientes activos' }, { n: '100%', l: 'Digital' }, { n: '24/7', l: 'Disponible' }].map((s) => (
            <div key={s.l}><p className="text-[22px] font-bold text-white">{s.n}</p><p className="text-[11px] text-white/40 font-medium">{s.l}</p></div>
          ))}
        </motion.div>
      </div>
      <motion.div {...fadeUp(0.2)} className="md:w-[45%] flex justify-center">
        <CreditCard />
      </motion.div>
    </div>
  </section>
);

const HeroEmpresas = ({ onNavigateToLogin }) => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#0A2540] via-[#1B3A5C] to-[#2D5F8A] animate-gradient" />
    <div className="absolute top-[-100px] left-[-80px] w-[400px] h-[400px] rounded-full bg-[#1973B8]/15 blur-3xl" />
    <div className="absolute bottom-[-80px] right-[-60px] w-[350px] h-[350px] rounded-full bg-[#F0AD4E]/10 blur-3xl" />

    <div className="relative max-w-[1200px] mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
      <div className="md:w-[55%] text-center md:text-left">
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#F0AD4E] animate-pulse" />
          <span className="text-white/80 text-[12px] font-medium tracking-wide">Banca Empresas EkuBank</span>
        </motion.div>
        <motion.h1 {...fadeUp(0.1)} className="text-[40px] md:text-[52px] font-bold text-white leading-[1.08] tracking-tight mb-5">
          Haz crecer tu<br /><span className="text-[#F0AD4E]">negocio</span> con nosotros
        </motion.h1>
        <motion.p {...fadeUp(0.15)} className="text-[15px] text-white/60 leading-relaxed mb-8 max-w-[480px] md:mx-0 mx-auto">
          Soluciones financieras diseñadas para PYMEs y grandes empresas. Líneas de crédito, factoring,
          leasing y herramientas de cobro para optimizar tu flujo de caja.
        </motion.p>
        <motion.div {...fadeUp(0.2)} className="flex gap-3 flex-wrap justify-center md:justify-start">
          <button onClick={onNavigateToLogin} className="bg-[#F0AD4E] text-[#0A2540] px-7 py-3.5 rounded-[12px] text-[14px] font-bold hover:bg-[#F5C46A] transition-all">
            Abrir cuenta empresa
          </button>
          <button className="bg-white/10 text-white border border-white/20 px-7 py-3.5 rounded-[12px] text-[14px] font-semibold hover:bg-white/20 transition-all">
            Hablar con un asesor
          </button>
        </motion.div>
        <motion.div {...fadeUp(0.25)} className="flex gap-8 mt-10 justify-center md:justify-start">
          {[{ n: '50K+', l: 'Empresas clientes' }, { n: 'S/500M', l: 'En créditos' }, { n: '0.5%', l: 'Tasa preferencial' }].map((s) => (
            <div key={s.l}><p className="text-[22px] font-bold text-white">{s.n}</p><p className="text-[11px] text-white/40 font-medium">{s.l}</p></div>
          ))}
        </motion.div>
      </div>
      <motion.div {...fadeUp(0.2)} className="md:w-[45%] flex justify-center">
        <div className="relative">
          <div className="w-[320px] bg-white/10 backdrop-blur-md rounded-[20px] border border-white/20 p-6 space-y-4">
            {[
              { icon: '📊', title: 'Línea de Crédito', value: 'Hasta S/ 500,000', color: '#F0AD4E' },
              { icon: '📋', title: 'Factoring', value: 'Desde 0.8% mensual', color: '#49D0A0' },
              { icon: '🏗️', title: 'Leasing', value: 'Plazo hasta 60 meses', color: '#1973B8' },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-[12px] p-4 flex items-center gap-3 hover:bg-white/15 transition-colors">
                <span className="text-[22px]">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-[13px] font-semibold">{item.title}</p>
                  <p className="text-white/50 text-[11px]">{item.value}</p>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
              </div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
            className="absolute -bottom-4 -left-6 bg-white rounded-[12px] px-3.5 py-2.5 shadow-lg flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#E6F7F0] flex items-center justify-center text-[14px]">✓</span>
            <div><p className="text-[10px] font-bold text-[#0F6E56]">Crédito aprobado</p><p className="text-[9px] text-gray-400">S/ 250,000</p></div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

const HeroPrivada = ({ onNavigateToLogin }) => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] animate-gradient" />
    <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#C9A84C]/10 blur-3xl" />
    <div className="absolute bottom-[-80px] left-[-50px] w-[300px] h-[300px] rounded-full bg-[#C9A84C]/5 blur-3xl" />

    <div className="relative max-w-[1200px] mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
      <div className="md:w-[55%] text-center md:text-left">
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-[#C9A84C]/10 backdrop-blur-sm border border-[#C9A84C]/30 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#C9A84C]" />
          <span className="text-[#C9A84C] text-[12px] font-medium tracking-wide">Banca Privada EkuBank</span>
        </motion.div>
        <motion.h1 {...fadeUp(0.1)} className="text-[40px] md:text-[52px] font-bold text-white leading-[1.08] tracking-tight mb-5">
          Tu patrimonio<br />merece atención{' '}<span className="text-[#C9A84C]">exclusiva</span>
        </motion.h1>
        <motion.p {...fadeUp(0.15)} className="text-[15px] text-white/50 leading-relaxed mb-8 max-w-[480px] md:mx-0 mx-auto">
          Gestión patrimonial personalizada, inversiones globales y un asesor dedicado
          para proteger y hacer crecer tu legado financiero.
        </motion.p>
        <motion.div {...fadeUp(0.2)} className="flex gap-3 flex-wrap justify-center md:justify-start">
          <button onClick={onNavigateToLogin} className="bg-[#C9A84C] text-[#1A1A2E] px-7 py-3.5 rounded-[12px] text-[14px] font-bold hover:bg-[#D4B85C] transition-all">
            Solicitar asesor
          </button>
          <button className="bg-white/5 text-white border border-[#C9A84C]/30 px-7 py-3.5 rounded-[12px] text-[14px] font-semibold hover:bg-white/10 transition-all">
            Conocer beneficios
          </button>
        </motion.div>
        <motion.div {...fadeUp(0.25)} className="flex gap-8 mt-10 justify-center md:justify-start">
          {[{ n: 'S/1M+', l: 'Patrimonio mínimo' }, { n: '1:1', l: 'Asesor dedicado' }, { n: 'Global', l: 'Inversiones' }].map((s) => (
            <div key={s.l}><p className="text-[22px] font-bold text-white">{s.n}</p><p className="text-[11px] text-white/30 font-medium">{s.l}</p></div>
          ))}
        </motion.div>
      </div>
      <motion.div {...fadeUp(0.2)} className="md:w-[45%] flex justify-center">
        <div className="relative">
          <div className="w-[340px] h-[210px] rounded-[20px] bg-gradient-to-br from-[#1A1A2E] to-[#0F3460] border border-[#C9A84C]/30 shadow-2xl shadow-black/30 p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#C9A84C]/10" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <span className="text-[#C9A84C] text-[18px] font-bold tracking-[2px]">EkuBank</span>
                <span className="bg-[#C9A84C]/20 text-[#C9A84C] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Platinum</span>
              </div>
              <p className="text-[#C9A84C]/60 text-[14px] font-mono tracking-[3px] mb-6">•••• •••• •••• 9012</p>
              <div className="flex justify-between items-end">
                <div><p className="text-[#C9A84C]/40 text-[9px] uppercase tracking-[1px]">Titular</p><p className="text-white text-[13px] font-medium">CLIENTE VIP</p></div>
                <div className="flex -space-x-2"><div className="w-7 h-7 rounded-full bg-[#C9A84C]/80" /><div className="w-7 h-7 rounded-full bg-[#C9A84C]/40" /></div>
              </div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="absolute -bottom-4 -right-4 bg-white rounded-[12px] px-4 py-3 shadow-xl">
            <p className="text-[10px] text-gray-400">Rendimiento anual</p>
            <p className="text-[18px] font-bold text-[#0F6E56]">+12.4%</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ══════════════════════════════════════════════
// FEATURES
// ══════════════════════════════════════════════

const FeatureCard = ({ icon, color, bg, title, desc, delay = 0 }) => (
  <motion.div {...fadeUp(delay)}
    className="bg-white border border-[#EAECF0] rounded-[20px] p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
      style={{ background: bg, color }}>{icon}</div>
    <p className="text-[16px] font-bold text-[#072146] mb-2">{title}</p>
    <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
  </motion.div>
);

const FeaturesPersonas = () => (
  <section className="py-20 px-6 bg-[#FAFBFD]">
    <div className="max-w-[1100px] mx-auto">
      <motion.div {...fadeUp()} className="text-center mb-14">
        <p className="text-[#1973B8] text-[11px] font-bold uppercase tracking-[2px] mb-3">Diseñado para ti</p>
        <h2 className="text-[30px] md:text-[38px] font-bold text-[#072146] tracking-tight leading-tight">
          Tú decides el ritmo.<br />Nosotros te damos las herramientas.
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FeatureCard delay={0}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          color="#004481" bg="#EEF3FB" title="Seguridad total"
          desc="Tu dinero protegido con encriptación de grado bancario, autenticación multifactor y monitoreo 24/7." />
        <FeatureCard delay={0.1}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
          color="#0F6E56" bg="#E6F7F0" title="Control en tiempo real"
          desc="Consulta saldos, movimientos e historial al instante desde tu celular o computadora." />
        <FeatureCard delay={0.2}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          color="#92400E" bg="#FEF3C7" title="Beneficios exclusivos"
          desc="Acumula puntos con cada operación y canjea por viajes, cashback y descuentos." />
      </div>
    </div>
  </section>
);

const FeaturesEmpresas = () => (
  <section className="py-20 px-6 bg-[#FAFBFD]">
    <div className="max-w-[1100px] mx-auto">
      <motion.div {...fadeUp()} className="text-center mb-14">
        <p className="text-[#F0AD4E] text-[11px] font-bold uppercase tracking-[2px] mb-3">Soluciones empresariales</p>
        <h2 className="text-[30px] md:text-[38px] font-bold text-[#072146] tracking-tight leading-tight">
          Herramientas financieras<br />para hacer crecer tu empresa.
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FeatureCard delay={0}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
          color="#0A2540" bg="#EEF3FB" title="Líneas de crédito"
          desc="Financiamiento flexible desde S/ 10,000 hasta S/ 500,000 con tasas preferenciales para tu negocio." />
        <FeatureCard delay={0.1}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          color="#0F6E56" bg="#E6F7F0" title="Factoring electrónico"
          desc="Anticipa el cobro de tus facturas y mejora tu liquidez desde el mismo día. Sin garantías." />
        <FeatureCard delay={0.2}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          color="#92400E" bg="#FEF3C7" title="Planilla automática"
          desc="Paga a tus colaboradores de forma masiva, segura y programada. Integración con SUNAT." />
      </div>
    </div>
  </section>
);

const FeaturesPrivada = () => (
  <section className="py-20 px-6 bg-[#FAFBFD]">
    <div className="max-w-[1100px] mx-auto">
      <motion.div {...fadeUp()} className="text-center mb-14">
        <p className="text-[#C9A84C] text-[11px] font-bold uppercase tracking-[2px] mb-3">Exclusividad</p>
        <h2 className="text-[30px] md:text-[38px] font-bold text-[#072146] tracking-tight leading-tight">
          Un servicio diseñado<br />para patrimonios exigentes.
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FeatureCard delay={0}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          color="#1A1A2E" bg="#F0EDE6" title="Asesor dedicado"
          desc="Un ejecutivo exclusivo que conoce tu perfil, tus metas y diseña estrategias personalizadas para ti." />
        <FeatureCard delay={0.1}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>}
          color="#0F6E56" bg="#E6F7F0" title="Inversiones globales"
          desc="Acceso a fondos internacionales, bonos, acciones y activos alternativos en los principales mercados." />
        <FeatureCard delay={0.2}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          color="#92400E" bg="#FEF3C7" title="Planificación patrimonial"
          desc="Protege tu legado con fideicomisos, seguros premium y planificación sucesoria integral." />
      </div>
    </div>
  </section>
);

// ══════════════════════════════════════════════
// CREDIT CARD component
// ══════════════════════════════════════════════
const CreditCard = () => (
  <div className="relative">
    <div className="w-[340px] h-[210px] rounded-[20px] bg-gradient-to-br from-[#004481] to-[#072146] border border-white/10 shadow-2xl shadow-black/30 p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#1973B8]/30" />
      <div className="absolute bottom-[-50px] left-[-30px] w-32 h-32 rounded-full bg-[#49D0A0]/10" />
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <span className="text-white/80 text-[18px] font-bold tracking-[2px]">EkuBank</span>
          <span className="bg-[#49D0A0]/20 text-[#49D0A0] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Visa Oro</span>
        </div>
        <p className="text-white/60 text-[14px] font-mono tracking-[3px] mb-6">•••• •••• •••• 4821</p>
        <div className="flex justify-between items-end">
          <div><p className="text-white/40 text-[9px] uppercase tracking-[1px]">Titular</p><p className="text-white text-[13px] font-medium">JUAN C. PEREZ</p></div>
          <div className="text-right"><p className="text-white/40 text-[9px] uppercase tracking-[1px]">Vence</p><p className="text-white text-[13px] font-medium">12/28</p></div>
          <div className="flex -space-x-2"><div className="w-7 h-7 rounded-full bg-[#F0C040]/80" /><div className="w-7 h-7 rounded-full bg-[#E24B4A]/60" /></div>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-4 -right-4 bg-white rounded-[14px] px-4 py-3 shadow-xl flex items-center gap-2.5">
      <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#49D0A0] to-[#1D9E75] flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </div>
      <div><p className="text-[11px] font-bold text-[#072146]">FIFA 2026</p><p className="text-[10px] text-gray-400">Sorteo activo</p></div>
    </div>
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.4 }}
      className="absolute -top-3 -left-6 bg-white rounded-[12px] px-3.5 py-2.5 shadow-lg flex items-center gap-2">
      <span className="w-8 h-8 rounded-full bg-[#E6F7F0] flex items-center justify-center text-[14px]">✓</span>
      <div><p className="text-[10px] font-bold text-[#0F6E56]">+S/ 1,800.00</p><p className="text-[9px] text-gray-400">Depósito recibido</p></div>
    </motion.div>
  </div>
);

export default Home;
