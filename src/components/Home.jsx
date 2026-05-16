import { motion } from 'framer-motion';

// Logo BBVA construido en SVG puro — sin imágenes externas
const BbvaLogo = ({ size = 28, color = '#004481' }) => (
  <svg width={size * 3.5} height={size} viewBox="0 0 98 28" fill="none" aria-label="BBVA">
    <text
      x="0" y="22"
      fontFamily="'DM Sans', 'Helvetica Neue', Arial, sans-serif"
      fontSize="26"
      fontWeight="700"
      fill={color}
      letterSpacing="2"
    >
      BBVA
    </text>
  </svg>
);

const Home = ({ onNavigateToLogin }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#072146]">

      {/* ── NAVBAR ── */}
      <nav className="flex justify-between items-center px-8 h-16 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-9">
          <div className="flex items-center gap-2">
            <BbvaLogo />
            <span className="w-1.5 h-1.5 rounded-full bg-[#49D0A0]" />
          </div>
          <div className="hidden md:flex gap-6">
            <a href="#" className="text-[13px] font-semibold text-[#072146] border-b-2 border-[#004481] pb-0.5">
              Personas
            </a>
            <a href="#" className="text-[13px] font-semibold text-gray-500 hover:text-[#072146] transition-colors pb-0.5">
              Empresas
            </a>
            <a href="#" className="text-[13px] font-semibold text-gray-500 hover:text-[#072146] transition-colors pb-0.5">
              Tarjeta de Crédito
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="bg-[#F2F4F7] text-[#072146] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#E5E9F0] transition-colors">
            Abre tu cuenta
          </button>
          <button
            onClick={onNavigateToLogin}
            className="bg-[#004481] text-white px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#1565C0] transition-colors"
          >
            Banca por Internet
          </button>
          <button className="text-[#072146] font-semibold text-[13px] flex items-center gap-1 ml-1">
            Menú
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main className="max-w-[1100px] mx-auto px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-8">

        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="md:w-1/2"
        >
          <p className="flex items-center gap-2 text-[11px] font-bold text-[#1973B8] uppercase tracking-[1.5px] mb-4">
            <span className="inline-block w-5 h-0.5 bg-[#49D0A0] rounded" />
            Tarjeta de Crédito BBVA
          </p>
          <h1 className="text-[42px] md:text-[46px] font-bold text-[#072146] leading-[1.1] tracking-tight mb-5">
            ¡Queremos verte<br />en la <span className="text-[#1973B8]">tribuna!</span>
          </h1>
          <p className="text-[14px] text-gray-500 leading-relaxed mb-8 max-w-[430px]">
            Gana uno de los dos paquetes dobles a la Copa Mundial de la FIFA 2026™, gracias a Visa.
            Además, sorteamos cientos de premios entre consolas, televisores, parrillas y más.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button className="bg-[#004481] text-white px-7 py-3 rounded-[10px] text-[14px] font-semibold hover:bg-[#1565C0] transition-colors">
              Solicítala aquí
            </button>
            <button className="bg-[#F0F5FB] text-[#004481] px-7 py-3 rounded-[10px] text-[14px] font-semibold hover:bg-[#E0EAF5] transition-colors">
              Inscríbete aquí
            </button>
          </div>
        </motion.div>

        {/* Imagen / placeholder */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="md:w-1/2"
        >
          <div className="w-full h-[340px] bg-[#EEF3FB] rounded-2xl overflow-hidden relative flex items-center justify-center">
            {/* Descomenta cuando tengas la imagen: */}
            {/* <img src={promoImg} alt="Promo FIFA 2026" className="w-full h-full object-cover" /> */}

            {/* Placeholder visual */}
            <div className="flex flex-col items-center gap-3 px-8">
              <div className="w-20 h-20 rounded-full bg-[#004481] flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <span className="bg-[#49D0A0] text-[#04342C] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                FIFA World Cup 2026
              </span>
              <p className="text-[13px] font-semibold text-[#004481] text-center">Tu imagen de promo aquí</p>
              <p className="text-[11px] text-gray-400 text-center font-mono">assets/promo-mundial.jpg</p>
            </div>

            {/* Tarjeta flotante decorativa */}
            <div className="absolute bottom-5 right-5 bg-white rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,68,129,0.12)] flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-[3px] bg-[#F0C040]" />
              <div>
                <p className="text-[10px] text-gray-400 font-mono tracking-widest">•••• •••• 4821</p>
                <p className="text-[11px] font-semibold text-[#072146]">BBVA Visa Oro</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── SECCIÓN INFERIOR ── */}
      <section className="bg-[#F8FAFC] border-t border-[#EAECF0] py-14 px-8">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-[28px] md:text-[34px] font-bold text-[#072146] text-center tracking-tight mb-10">
            Tú decides el ritmo.<br />Nosotros te damos las herramientas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: 'Seguridad total',
                desc: 'Tu dinero protegido con tecnología de punta las 24 horas del día.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                ),
                title: 'Control en tiempo real',
                desc: 'Mira tus movimientos al instante desde cualquier dispositivo.',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ),
                title: 'Beneficios exclusivos',
                desc: 'Acumula puntos y accede a descuentos en miles de establecimientos.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white border border-[#EAECF0] rounded-2xl p-5 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#EEF3FB] text-[#004481] flex items-center justify-center">
                  {icon}
                </div>
                <p className="text-[14px] font-bold text-[#072146]">{title}</p>
                <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
