import { motion } from 'framer-motion';

// Logo BBVA en SVG puro — sin dependencias externas
const BbvaLogo = ({ size = 22, color = '#ffffff' }) => (
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

// Icono flecha arriba/abajo simple
const ArrowIcon = ({ dir = 'down', size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {dir === 'down'
      ? <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
      : <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
    }
  </svg>
);

const TRANSACTIONS = [
  { name: 'Plaza Vea', date: 'Hoy, 10:34 am', amount: -124.50, category: 'shop' },
  { name: 'Transferencia recibida', date: 'Ayer, 3:15 pm', amount: +500.00, category: 'bank' },
  { name: 'Recarga Claro', date: '13 may, 8:02 pm', amount: -30.00, category: 'phone' },
  { name: 'Netflix', date: '12 may, 12:00 am', amount: -37.90, category: 'play' },
];

const categoryStyle = {
  shop:  { bg: '#EEF3FB', color: '#004481', icon: '🛒' },
  bank:  { bg: '#E6F7F0', color: '#0F6E56', icon: '🏦' },
  phone: { bg: '#FEF3C7', color: '#92400E', icon: '📱' },
  play:  { bg: '#F5F0FF', color: '#5B21B6', icon: '▶' },
};

const Dashboard = ({ user = { nombre: 'Juan Rodríguez', dni: '12345678', saldo: 'S/ 8,450.00' }, onLogout }) => {
  const initials = user.nombre
    ? user.nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : 'US';

  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans">

      {/* ── NAVBAR ── */}
      <nav className="bg-[#004481] h-[60px] px-7 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <BbvaLogo />
          <span className="w-1.5 h-1.5 rounded-full bg-[#49D0A0]" />
        </div>

        <div className="flex items-center gap-3">
          {/* Avatar + nombre */}
          <div className="w-[34px] h-[34px] rounded-full bg-white/15 flex items-center justify-center text-white text-[13px] font-bold select-none">
            {initials}
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[11px] text-white/60">Bienvenido de nuevo</span>
            <span className="text-[13px] font-semibold text-white">{user.nombre}</span>
          </div>

          {/* Notificaciones */}
          <button
            className="w-[34px] h-[34px] rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors ml-2"
            aria-label="Notificaciones"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="bg-red-600/80 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* ── CONTENIDO ── */}
      <main className="max-w-[900px] mx-auto px-6 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-[22px] font-bold text-[#072146] tracking-tight">Tus Posiciones</h1>
          <p className="text-[12px] text-gray-400 mt-0.5 capitalize">{today}</p>
        </motion.div>

        {/* Tarjeta de saldo principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="bg-[#004481] rounded-[18px] p-7 mb-6 relative overflow-hidden"
        >
          {/* Círculos decorativos */}
          <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-[-60px] left-16 w-40 h-40 rounded-full bg-white/[0.04] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-[11px] text-white/60 uppercase tracking-[1px] mb-1.5">Cuenta Independencia</p>
                <p className="text-[13px] text-white/80 font-medium">DNI asociado: {user.dni}</p>
              </div>
              <span className="bg-[#49D0A0]/20 text-[#49D0A0] text-[11px] font-bold px-2.5 py-1 rounded-full">
                Activa
              </span>
            </div>

            <p className="text-[38px] font-bold text-white tracking-tight font-mono">
              <span className="text-[20px] font-normal opacity-70 mr-1">S/</span>
              {user.saldo?.replace('S/', '').trim() || '8,450.00'}
            </p>

            <div className="flex gap-7 pt-5 mt-2 border-t border-white/10">
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-[0.8px] mb-1">N° de cuenta</p>
                <p className="text-[14px] font-semibold text-white font-mono">0011-0219-0100-4821</p>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-[0.8px] mb-1">CCI</p>
                <p className="text-[14px] font-semibold text-white font-mono">011-219-000048210-11</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            { label: 'Ingresos del mes', value: 'S/ 3,200', sub: '+12% vs mes anterior', dir: 'down', accent: '#0F6E56', bg: '#E6F7F0' },
            { label: 'Gastos del mes',   value: 'S/ 1,840', sub: 'Dentro del presupuesto', dir: 'up',   accent: '#004481', bg: '#EEF3FB' },
          ].map(({ label, value, sub, dir, accent, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-2xl p-[18px] border border-[#EAECF0]"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.8px]">{label}</span>
                <div
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center"
                  style={{ background: bg, color: accent }}
                >
                  <ArrowIcon dir={dir} size={14} color={accent} />
                </div>
              </div>
              <p className="text-[22px] font-bold text-[#072146] font-mono tracking-tight">{value}</p>
              <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Últimos movimientos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-[18px] border border-[#EAECF0]"
        >
          <p className="text-[13px] font-bold text-[#072146] mb-4">Últimos movimientos</p>
          <div className="flex flex-col gap-3">
            {TRANSACTIONS.map(({ name, date, amount, category }) => {
              const { bg, color, icon } = categoryStyle[category];
              const isPos = amount > 0;
              return (
                <div key={name + date} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[16px] flex-shrink-0"
                    style={{ background: bg, color }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A2B4A] truncate">{name}</p>
                    <p className="text-[11px] text-gray-400">{date}</p>
                  </div>
                  <span
                    className="text-[13px] font-bold font-mono flex-shrink-0"
                    style={{ color: isPos ? '#0F6E56' : '#DC2626' }}
                  >
                    {isPos ? '+' : ''} S/ {Math.abs(amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
