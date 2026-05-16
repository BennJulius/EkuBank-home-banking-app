import { motion } from 'framer-motion';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#F4F4F4] font-sans">
      {/* Navbar Interno */}
      <nav className="bg-[#072146] text-white p-4 flex justify-between items-center shadow-md">
        <div className="text-xl font-bold tracking-tighter">BBVA</div>
        <div className="flex items-center space-x-4">
          <span className="text-sm hidden sm:block">Hola, {user.nombre}</span>
          <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-xs font-bold transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* Contenido del Dashboard (C5) */}
      <main className="max-w-5xl mx-auto p-8">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-[#072146] mb-8">
          Tus Posiciones
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta de Cuenta */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-[#1973B8]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-gray-500 uppercase">Cuenta Independencia</h2>
              <span className="text-xs bg-[#E5F0F6] text-[#1973B8] px-2 py-1 rounded font-bold">Activa</span>
            </div>
            <p className="text-3xl font-bold text-[#072146] mb-1">{user.saldo}</p>
            <p className="text-xs text-gray-400">DNI asociado: {user.dni}</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;