import { motion } from 'framer-motion';
// import logoBbva from '../assets/logo-bbva.svg'; // Descomenta cuando tengas tu logo
// import promoImg from '../assets/promo-mundial.jpg'; // Descomenta cuando tengas la imagen

const Home = ({ onNavigateToLogin }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#072146]">
      
      {/* NAVBAR IDÉNTICO A LA CAPTURA */}
      <nav className="flex justify-between items-center py-4 px-8 border-b border-gray-100 shadow-sm">
        <div className="flex items-center space-x-8">
          <div className="text-3xl font-bold tracking-tighter text-[#072146]">
            BBVA {/* Puedes cambiar esto por <img src={logoBbva} alt="BBVA" className="h-6" /> */}
          </div>
          <div className="hidden md:flex space-x-6 text-sm font-bold">
            <a href="#" className="border-b-2 border-[#072146] pb-1">Personas</a>
            <a href="#" className="text-gray-500 hover:text-[#072146]">Empresas</a>
            <a href="#" className="text-gray-500 hover:text-[#072146] flex items-center">
              <span className="mr-1">💳</span> Obtén tu Tarjeta de Crédito
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="bg-[#F4F4F4] text-[#072146] px-4 py-2 font-bold text-sm rounded hover:bg-gray-200 transition-colors">
            Abre tu cuenta
          </button>
          {/* BOTÓN REQUERIDO POR RÚBRICA (C1) */}
          <button 
            onClick={onNavigateToLogin}
            className="bg-[#072146] text-white px-6 py-2 font-bold text-sm rounded hover:bg-[#1973B8] transition-colors"
          >
            Banca por Internet
          </button>
          <button className="text-[#072146] font-bold text-sm flex items-center">
            Menú <span className="ml-1">≡</span>
          </button>
        </div>
      </nav>

      {/* HERO SECTION (Basado en la captura) */}
      <main className="max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center justify-between">
        
        {/* Lado izquierdo: Textos y Botones */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          className="md:w-1/2 pr-8"
        >
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">
            Tarjeta de Crédito BBVA
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-[#072146] leading-tight mb-6 tracking-tighter">
            ¡Queremos verte en la tribuna!
          </h1>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            Gana uno de los dos paquetes dobles a la Copa Mundial de la FIFA 2026™, gracias a Visa. Además, sorteamos cientos de premios entre consolas, televisores, parrillas y más.
          </p>
          <div className="flex space-x-4">
            <button className="bg-[#072146] text-white px-8 py-3 font-bold rounded hover:bg-[#1973B8] transition-colors">
              Solicítala aquí
            </button>
            <button className="bg-[#F4F4F4] text-[#072146] px-8 py-3 font-bold rounded hover:bg-gray-200 transition-colors">
              Inscríbete aquí
            </button>
          </div>
        </motion.div>

        {/* Lado derecho: Imagen */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          className="md:w-1/2 mt-10 md:mt-0"
        >
          <div className="bg-gray-200 w-full h-[400px] rounded-2xl overflow-hidden shadow-xl flex items-center justify-center text-gray-400">
             {/* <img src={promoImg} alt="Promo" className="w-full h-full object-cover" /> */}
             <span className="text-sm font-bold">[PON TU IMAGEN AQUÍ EN SRC/ASSETS]</span>
          </div>
        </motion.div>

      </main>
      
      {/* SECCIÓN INFERIOR */}
      <div className="text-center py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-[#072146] tracking-tighter">
          Tú decides el ritmo. Nosotros te<br/>damos las herramientas
        </h2>
      </div>
    </div>
  );
};

export default Home;