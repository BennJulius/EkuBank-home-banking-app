import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Prestamo from '../Prestamo';
import EkuBankLogo from '../EkuBankLogo';

const API = 'https://ekubank.ekubyte.net.pe/api/controllers/TransferController.php';

const categoryStyle = {
  shop:  { bg: '#EEF3FB', color: '#004481', icon: '🛒' },
  bank:  { bg: '#E6F7F0', color: '#0F6E56', icon: '🏦' },
  phone: { bg: '#FEF3C7', color: '#92400E', icon: '📱' },
  play:  { bg: '#F5F0FF', color: '#5B21B6', icon: '▶' },
};

const inputClass = "w-full border-[1.5px] border-[#E0E6ED] rounded-[10px] bg-[#F8FAFC] focus:border-[#1973B8] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] focus:bg-white outline-none text-[14px] text-[#1A2B4A] px-3.5 h-[46px] placeholder:text-[#B0BEC5] transition-all";

const estadoColors = {
  pendiente: { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente' },
  aprobado:  { bg: '#E6F7F0', text: '#0F6E56', label: 'Aprobado' },
  rechazado: { bg: '#FEE2E2', text: '#DC2626', label: 'Rechazado' },
};

// ─── PANEL: Transferir ───
const PanelTransferir = ({ userDni, userToken, saldoDisponible, onDone, onClose }) => {
  const [dniDestino, setDniDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [alertData, setAlertData] = useState(null);

  const handleDni = (e) => { const v = e.target.value.replace(/[^0-9]/g, ''); if (v.length <= 8) setDniDestino(v); };

  const submit = (e) => {
    e.preventDefault();
    if (dniDestino.length < 8) { setMsg('El DNI destino debe tener 8 dígitos.'); return; }
    const m = parseFloat(monto);
    if (m <= 0) { setMsg('Ingresa un monto válido.'); return; }
    if (m > saldoDisponible) {
      setAlertData({
        title: 'Saldo Insuficiente',
        message: `No tienes saldo suficiente para transferir S/ ${m.toFixed(2)}. Tu saldo disponible es S/ ${saldoDisponible.toFixed(2)}.`
      });
      return;
    }
    setConfirmData({
      destino: dniDestino,
      monto: m,
      descripcion: descripcion || 'Sin concepto'
    });
  };

  const executeTransfer = async () => {
    setLoading(true); setMsg('');
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'transferir', token: userToken, dni_origen: userDni, dni_destino: confirmData.destino, monto: confirmData.monto, descripcion: confirmData.descripcion }) });
      const data = await res.json();
      setMsg(data.message); setOk(data.success);
      if (data.success) onDone(data.nuevo_saldo);
    } catch { setMsg('Error de conexión.'); }
    finally {
      setLoading(false);
      setConfirmData(null);
    }
  };

  return (
    <>
      <Panel title="Transferir" subtitle="A otra cuenta EkuBank" icon="↗" color="#004481" onClose={onClose}>
        {ok ? (
          <SuccessMsg msg={msg} onClose={onClose} />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="DNI del destinatario">
              <input type="text" inputMode="numeric" placeholder="12345678" value={dniDestino} onChange={handleDni} maxLength={8} required className={inputClass} />
            </Field>
            <Field label="Monto a transferir (S/)">
              <input type="number" placeholder="100.00" value={monto} onChange={(e) => setMonto(e.target.value)} min="0.01" step="0.01" required className={inputClass} />
            </Field>
            <Field label="Concepto (opcional)">
              <input type="text" placeholder="Ej. Pago almuerzo" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={inputClass} />
            </Field>
            {msg && <p className="text-red-600 text-[12px] font-medium text-center">{msg}</p>}
            <BtnSubmit loading={loading} label="Transferir ahora" />
          </form>
        )}
      </Panel>

      <AnimatePresence>
        {alertData && (
          <div className="fixed inset-0 bg-[#072146]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-2xl p-6 w-full max-w-[400px] text-center">
              <svg className="w-14 h-14 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-[18px] font-bold text-[#072146] mb-2">{alertData.title}</h3>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{alertData.message}</p>
              <button onClick={() => setAlertData(null)}
                className="w-full h-11 bg-[#004481] hover:bg-[#1565C0] text-white font-semibold rounded-[10px] transition-colors">
                Entendido
              </button>
            </motion.div>
          </div>
        )}

        {confirmData && (
          <div className="fixed inset-0 bg-[#072146]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-2xl overflow-hidden w-full max-w-[420px]">
              <div className="bg-gradient-to-r from-[#004481] to-[#1565C0] px-6 py-4 text-white">
                <p className="text-[10px] uppercase tracking-[1.2px] font-semibold opacity-75">Confirmación de Operación</p>
                <h3 className="text-[15px] font-bold">Transferencia Interbancaria/EkuBank</h3>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#EEF3FB] text-[#004481] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <p className="text-[13px] text-center text-gray-500 mb-5">Por favor, confirma los detalles de la transferencia bancaria:</p>
                <div className="bg-[#F8FAFC] border border-[#E0E6ED] rounded-[12px] p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">Desde cuenta</span>
                    <span className="font-semibold text-[#072146] font-mono">{userDni} (Tú)</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">Para DNI</span>
                    <span className="font-bold text-[#072146] font-mono">{confirmData.destino}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">Concepto</span>
                    <span className="font-medium text-gray-600 truncate max-w-[180px]">{confirmData.descripcion}</span>
                  </div>
                  <div className="border-t border-[#E0E6ED] pt-3 flex justify-between items-center">
                    <span className="text-[12px] text-[#004481] font-bold uppercase tracking-[0.5px]">Monto a Transferir</span>
                    <span className="text-[18px] font-black text-[#004481] font-mono">S/ {confirmData.monto.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setConfirmData(null)}
                    className="flex-1 h-11 border-[1.5px] border-[#E0E6ED] text-[#004481] hover:bg-[#F0F5FB] text-[13px] font-semibold rounded-[10px] transition-all">
                    Cancelar
                  </button>
                  <button type="button" onClick={executeTransfer} disabled={loading}
                    className="flex-1 h-11 bg-[#004481] hover:bg-[#1565C0] text-white text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── PANEL: Recargar ───
const PanelRecargar = ({ userDni, userToken, saldoDisponible, onDone, onClose }) => {
  const [telefono, setTelefono] = useState('');
  const [operador, setOperador] = useState('Claro');
  const [monto, setMonto] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [alertData, setAlertData] = useState(null);

  const montos = [5, 10, 20, 30, 50];

  const submit = (e) => {
    e.preventDefault();
    if (telefono.length < 9) { setMsg('Ingresa un número de 9 dígitos.'); return; }
    const m = parseFloat(monto);
    if (!m || m < 3) { setMsg('Monto mínimo S/ 3.'); return; }
    if (m > saldoDisponible) {
      setAlertData({
        title: 'Saldo Insuficiente',
        message: `No tienes saldo suficiente para realizar esta recarga de S/ ${m.toFixed(2)}. Tu saldo disponible es S/ ${saldoDisponible.toFixed(2)}.`
      });
      return;
    }
    setConfirmData({
      telefono,
      operador,
      monto: m
    });
  };

  const executeRecarga = async () => {
    setLoading(true); setMsg('');
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recargar', token: userToken, dni: userDni, telefono: confirmData.telefono, operador: confirmData.operador, monto: confirmData.monto }) });
      const data = await res.json();
      setMsg(data.message); setOk(data.success);
      if (data.success) onDone(data.nuevo_saldo);
    } catch { setMsg('Error de conexión.'); }
    finally {
      setLoading(false);
      setConfirmData(null);
    }
  };

  return (
    <>
      <Panel title="Recargar celular" subtitle="Recarga rápida" icon="📲" color="#0F6E56" onClose={onClose}>
        {ok ? (
          <SuccessMsg msg={msg} onClose={onClose} />
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Operador">
              <div className="grid grid-cols-3 gap-2">
                {['Claro', 'Movistar', 'Entel'].map((op) => (
                  <button key={op} type="button" onClick={() => setOperador(op)}
                    className={`py-2.5 rounded-[10px] text-[12px] font-semibold border-[1.5px] transition-all ${
                      operador === op ? 'bg-[#004481] border-[#004481] text-white' : 'bg-[#F8FAFC] border-[#E0E6ED] text-[#1A2B4A] hover:border-[#1973B8]'
                    }`}>{op}</button>
                ))}
              </div>
            </Field>
            <Field label="Número de celular">
              <input type="text" inputMode="numeric" placeholder="987654321" value={telefono}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); if (v.length <= 9) setTelefono(v); }}
                maxLength={9} required className={inputClass} />
            </Field>
            <Field label="Monto de recarga (S/)">
              <div className="grid grid-cols-5 gap-2 mb-2">
                {montos.map((m) => (
                  <button key={m} type="button" onClick={() => setMonto(String(m))}
                    className={`py-2 rounded-[8px] text-[12px] font-bold border transition-all ${
                      monto === String(m) ? 'bg-[#004481] border-[#004481] text-white' : 'bg-white border-[#E0E6ED] text-[#1A2B4A] hover:border-[#1973B8]'
                    }`}>S/{m}</button>
                ))}
              </div>
              <input type="number" placeholder="Otro monto" value={montos.includes(Number(monto)) ? '' : monto}
                onChange={(e) => setMonto(e.target.value)} min="3" max="100" className={inputClass} />
            </Field>
            {msg && <p className="text-red-600 text-[12px] font-medium text-center">{msg}</p>}
            <BtnSubmit loading={loading} label="Recargar ahora" />
          </form>
        )}
      </Panel>

      <AnimatePresence>
        {alertData && (
          <div className="fixed inset-0 bg-[#072146]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-2xl p-6 w-full max-w-[400px] text-center">
              <svg className="w-14 h-14 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-[18px] font-bold text-[#072146] mb-2">{alertData.title}</h3>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{alertData.message}</p>
              <button onClick={() => setAlertData(null)}
                className="w-full h-11 bg-[#004481] hover:bg-[#1565C0] text-white font-semibold rounded-[10px] transition-colors">
                Entendido
              </button>
            </motion.div>
          </div>
        )}

        {confirmData && (
          <div className="fixed inset-0 bg-[#072146]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-2xl overflow-hidden w-full max-w-[420px]">
              <div className="bg-gradient-to-r from-[#0F6E56] to-[#1F9F7D] px-6 py-4 text-white">
                <p className="text-[10px] uppercase tracking-[1.2px] font-semibold opacity-75">Confirmación de Operación</p>
                <h3 className="text-[15px] font-bold">Recarga de Celular</h3>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#E6F7F0] text-[#0F6E56] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-[13px] text-center text-gray-500 mb-5">Por favor, confirma los detalles de la recarga:</p>
                <div className="bg-[#F8FAFC] border border-[#E0E6ED] rounded-[12px] p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">Operador</span>
                    <span className="font-bold text-[#072146]">{confirmData.operador}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">Número celular</span>
                    <span className="font-bold text-[#072146] font-mono">{confirmData.telefono}</span>
                  </div>
                  <div className="border-t border-[#E0E6ED] pt-3 flex justify-between items-center">
                    <span className="text-[12px] text-[#0F6E56] font-bold uppercase tracking-[0.5px]">Monto de Recarga</span>
                    <span className="text-[18px] font-black text-[#0F6E56] font-mono">S/ {confirmData.monto.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setConfirmData(null)}
                    className="flex-1 h-11 border-[1.5px] border-[#E0E6ED] text-[#004481] hover:bg-[#F0F5FB] text-[13px] font-semibold rounded-[10px] transition-all">
                    Cancelar
                  </button>
                  <button type="button" onClick={executeRecarga} disabled={loading}
                    className="flex-1 h-11 bg-[#0F6E56] hover:bg-[#158C6F] text-white text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg">
                    {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── PANEL: Extracto ───
const PanelExtracto = ({ userDni, userToken, onClose }) => {
  const [txs, setTxs] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'extracto', token: userToken, dni: userDni }) });
        const data = await res.json();
        if (data.success) { setTxs(data.transacciones); setResumen(data.resumen); }
      } catch {} finally { setLoading(false); }
    })();
  }, [userDni]);

  const totalIng = Number(resumen.total_ingresos || 0);
  const totalEgr = Number(resumen.total_egresos || 0);

  return (
    <Panel title="Extracto de cuenta" subtitle="Historial completo" icon="📄" color="#5B21B6" onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-[#F0F2F5] rounded-[10px] p-3 text-center">
          <p className="text-[10px] text-gray-400 font-medium">Operaciones</p>
          <p className="text-[18px] font-bold text-[#072146]">{resumen.total_operaciones || 0}</p>
        </div>
        <div className="bg-[#E6F7F0] rounded-[10px] p-3 text-center">
          <p className="text-[10px] text-[#0F6E56]/60 font-medium">Ingresos</p>
          <p className="text-[16px] font-bold text-[#0F6E56]">S/ {totalIng.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-red-50 rounded-[10px] p-3 text-center">
          <p className="text-[10px] text-red-400 font-medium">Egresos</p>
          <p className="text-[16px] font-bold text-[#DC2626]">S/ {totalEgr.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-6"><span className="w-6 h-6 border-2 border-[#004481]/20 border-t-[#004481] rounded-full animate-spin inline-block" /></div>
      ) : txs.length === 0 ? (
        <p className="text-center text-[13px] text-gray-400 py-6">Sin movimientos registrados.</p>
      ) : (
        <div className="max-h-[350px] overflow-y-auto divide-y divide-[#F0F2F5] -mx-1 px-1">
          {txs.map((tx, i) => {
            const cat = categoryStyle[tx.category] || categoryStyle.shop;
            const isPos = parseFloat(tx.amount) > 0;
            return (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[14px] shrink-0"
                  style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1A2B4A] truncate">{tx.name}</p>
                  <p className="text-[10px] text-gray-400">{tx.date} · {tx.canal}</p>
                </div>
                <span className="text-[12px] font-bold font-mono shrink-0" style={{ color: isPos ? '#0F6E56' : '#DC2626' }}>
                  {isPos ? '+' : ''}S/ {Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
};

// ─── Shared UI helpers ───
const Panel = ({ title, subtitle, icon, color, onClose, children }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
    className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden mb-5">
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAECF0]" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
      <div className="flex items-center gap-3">
        <span className="text-[20px]">{icon}</span>
        <div>
          <p className="text-white font-semibold text-[14px]">{title}</p>
          <p className="text-white/60 text-[11px]">{subtitle}</p>
        </div>
      </div>
      <button onClick={onClose} className="text-white/60 hover:text-white text-[20px] leading-none transition-colors">&times;</button>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-1.5">{label}</label>
    {children}
  </div>
);

const BtnSubmit = ({ loading, label }) => (
  <button type="submit" disabled={loading}
    className="w-full h-12 rounded-[10px] bg-[#004481] hover:bg-[#1565C0] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-65 disabled:cursor-not-allowed">
    {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Procesando...</> : label}
  </button>
);

const SuccessMsg = ({ msg, onClose }) => (
  <div className="text-center py-4">
    <div className="w-14 h-14 rounded-full bg-[#E6F7F0] flex items-center justify-center mx-auto mb-3">
      <svg className="w-7 h-7 text-[#0F6E56]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <p className="text-[15px] font-bold text-[#0F6E56] mb-1">¡Operación exitosa!</p>
    <p className="text-[13px] text-gray-500 mb-4">{msg}</p>
    <button onClick={onClose} className="px-5 py-2 rounded-[10px] bg-[#004481] text-white text-[13px] font-semibold hover:bg-[#1565C0] transition-colors">Cerrar</button>
  </div>
);


// ─── DASHBOARD PRINCIPAL ───
const Dashboard = ({ user, onLogout }) => {
  const [cuenta, setCuenta] = useState('Cargando...');
  const [saldo, setSaldo] = useState('0.00');
  const [score, setScore] = useState(650);
  const [movimientos, setMovimientos] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [showSaldo, setShowSaldo] = useState(true);
  const [activePanel, setActivePanel] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState([]);

  // Estados locales para simular pagos de cuotas de préstamo y modales
  const [pagosRealizados, setPagosRealizados] = useState([]);
  const [saldoDeducido, setSaldoDeducido] = useState(0);
  const [transaccionesAdicionales, setTransaccionesAdicionales] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [expandedCronograma, setExpandedCronograma] = useState(null);
  const [loanConfirmData, setLoanConfirmData] = useState(null);
  const [alertData, setAlertData] = useState(null);

  const getLoanStatus = (pr) => {
    const paymentDay = Number(pr.dia_pago || 15);
    const diasAtraso = Number(pr.dias_atraso_mes || 0);
    const cuota = Number(pr.cuota_mensual || 0);

    if (diasAtraso > 0) {
      const dailyRate = 0.003; // 0.3% multa diaria
      const mora = Math.round(cuota * dailyRate * diasAtraso * 100) / 100;
      return {
        status: 'mora',
        label: `Vencido (${diasAtraso} días de atraso)`,
        color: '#DC2626',
        bg: '#FEE2E2',
        mora,
        diasAtraso,
        paymentDay,
        paymentText: `Venció el día ${paymentDay} de este mes.`,
        totalAPagar: Math.round((cuota + mora) * 100) / 100
      };
    } else {
      const today = new Date().getDate();
      if (today === paymentDay) {
        return {
          status: 'vence_hoy',
          label: 'Vence hoy',
          color: '#D97706',
          bg: '#FEF3C7',
          mora: 0,
          diasAtraso: 0,
          paymentDay,
          paymentText: `Tu cuota vence hoy. Por favor realiza el pago.`,
          totalAPagar: cuota
        };
      } else if (today < paymentDay && (paymentDay - today) <= 3) {
        const daysLeft = paymentDay - today;
        return {
          status: 'proximo',
          label: `Próximo a vencer (${daysLeft} días)`,
          color: '#D97706',
          bg: '#FEF3C7',
          mora: 0,
          diasAtraso: 0,
          paymentDay,
          paymentText: pr.fecha_siguiente_pago ? `Vence el: ${pr.fecha_siguiente_pago}` : `Vence el día ${paymentDay} de este mes.`,
          totalAPagar: cuota
        };
      } else {
        return {
          status: 'aldia',
          label: 'Al día',
          color: '#059669',
          bg: '#D1FAE5',
          mora: 0,
          diasAtraso: 0,
          paymentDay,
          paymentText: pr.fecha_siguiente_pago ? `Próximo pago: ${pr.fecha_siguiente_pago}` : `Próximo pago: el día ${paymentDay} de cada mes.`,
          totalAPagar: cuota
        };
      }
    }
  };

  const handlePagarCuota = (pr, status) => {
    const total = status.totalAPagar;
    if (saldoNum < total) {
      setAlertData({
        title: "Saldo Insuficiente",
        message: "No cuentas con saldo suficiente en tu cuenta de ahorros para realizar el pago de la cuota."
      });
      return;
    }

    setLoanConfirmData({ pr, status });
  };

  const executePagarCuota = async (pr, status) => {
    const total = status.totalAPagar;
    try {
      const res = await fetch('https://ekubank.ekubyte.net.pe/api/controllers/TransferController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pagar_cuota',
          token: user?.token,
          dni: user?.dni,
          prestamo_id: pr.codigo,
          monto: total
        })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage({
          type: 'success',
          text: `¡Cuota de S/ ${total.toFixed(2)} pagada con éxito!`
        });
        setTimeout(() => setToastMessage(null), 4000);
        
        // Actualizar saldo y pagos realizados localmente de inmediato
        if (data.nuevo_saldo !== undefined) {
          setSaldo(data.nuevo_saldo);
        }
        setPagosRealizados(prev => [...prev, pr.codigo]);
        
        // Agregar la transacción simulada de inmediato para una retroalimentación más rápida
        const newTx = {
          name: `Pago Cuota Préstamo PRE-${String(pr.codigo).padStart(6, '0')}`,
          date: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) + ', ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true }),
          amount: -total,
          category: 'bank',
          canal: 'homebanking'
        };
        setTransaccionesAdicionales(prev => [newTx, ...prev]);

        // Refrescar el dashboard con los datos reales recalculados
        fetchDashboard();
      } else {
        setToastMessage({
          type: 'error',
          text: data.message || 'Error al procesar el pago.'
        });
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Error de conexión.'
      });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setLoanConfirmData(null);
    }
  };

  const generateCronograma = (pr, cuotasPagadas) => {
    const list = [];
    const startStr = pr.fecha_solicitud || '18/06/2026';
    const parts = startStr.split('/');
    let startDay = 15;
    let startMonth = 5; // Junio (0-indexed)
    let startYear = 2026;
    
    if (parts.length === 3) {
      startDay = parseInt(parts[0], 10);
      startMonth = parseInt(parts[1], 10) - 1;
      startYear = parseInt(parts[2], 10);
    }

    const payDay = Number(pr.dia_pago || 15);
    const plazo = Number(pr.plazo_meses);
    const cuotaVal = Number(pr.cuota_mensual);
    const todayDate = new Date();

    for (let i = 1; i <= plazo; i++) {
      const dueDate = new Date(startYear, startMonth + i, payDay);
      const dd = String(dueDate.getDate()).padStart(2, '0');
      const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
      const yyyy = dueDate.getFullYear();
      const formattedDate = `${dd}/${mm}/${yyyy}`;

      let statusLabel = 'Pendiente';
      let statusColor = '#4B5563';
      let statusBg = '#F3F4F6';
      let total = cuotaVal;

      if (i <= cuotasPagadas) {
        statusLabel = 'Pagado';
        statusColor = '#059669';
        statusBg = '#D1FAE5';
      } else if (i === cuotasPagadas + 1) {
        const todayDay = todayDate.getDate();
        if (todayDate.getMonth() === dueDate.getMonth() && todayDate.getFullYear() === dueDate.getFullYear()) {
          if (todayDay > payDay) {
            const delayDays = todayDay - payDay;
            const dailyRate = 0.003;
            const mora = Math.round(cuotaVal * dailyRate * delayDays * 100) / 100;
            statusLabel = `Vencido (+S/ ${mora.toFixed(2)} mora)`;
            statusColor = '#DC2626';
            statusBg = '#FEE2E2';
            total += mora;
          } else if (todayDay === payDay) {
            statusLabel = 'Vence hoy';
            statusColor = '#D97706';
            statusBg = '#FEF3C7';
          } else if (payDay - todayDay <= 3) {
            statusLabel = 'Próximo';
            statusColor = '#D97706';
            statusBg = '#FEF3C7';
          }
        } else if (todayDate.getTime() > dueDate.getTime()) {
          const delayDays = Math.round((todayDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const dailyRate = 0.003;
          const mora = Math.round(cuotaVal * dailyRate * delayDays * 100) / 100;
          statusLabel = `Vencido (+S/ ${mora.toFixed(2)} mora)`;
          statusColor = '#DC2626';
          statusBg = '#FEE2E2';
          total += mora;
        }
      }

      list.push({
        n: i,
        fechaVencimiento: formattedDate,
        statusLabel,
        statusColor,
        statusBg,
        total
      });
    }

    return list;
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('https://ekubank.ekubyte.net.pe/api/controllers/ClientController.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: user?.dni, token: user?.token }),
      });
      const data = await res.json();
      if (data.success) {
        setCuenta(data.cuenta);
        setSaldo(data.saldo);
        setScore(data.score || 650);
        setMovimientos(data.transacciones);
        setPrestamos(data.prestamos || []);
        if (data.alertas && data.alertas.length > 0) {
          setSecurityAlerts(prev => {
            const ids = new Set(prev.map(a => a.id));
            const newAlerts = data.alertas.filter(a => !ids.has(a.id));
            return [...prev, ...newAlerts];
          });
        }
      }
    } catch (error) { console.error('Error cargando dashboard:', error); }
    finally { setIsLoadingData(false); }
  }, [user?.dni]);

  useEffect(() => {
    if (user?.dni) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 5000);
      return () => clearInterval(interval);
    }
  }, [user, fetchDashboard]);

  const handleOperationDone = (nuevoSaldo) => {
    if (nuevoSaldo !== undefined) setSaldo(nuevoSaldo);
    setTimeout(() => fetchDashboard(), 1000);
  };

  const togglePanel = (panel) => setActivePanel(activePanel === panel ? null : panel);

  const initials = user?.nombre ? user.nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() : 'US';
  const today = new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const saldoNum = parseFloat(String(saldo).replace(/[^0-9.-]+/g, '') || 0) - saldoDeducido;

  const prestamosActivos = prestamos.filter(p => p.estado === 'aprobado');
  const prestamosPendientes = prestamos.filter(p => p.estado === 'pendiente');
  const deudaTotal = prestamosActivos.reduce((s, p) => {
    const isPaid = pagosRealizados.includes(p.codigo);
    const actualDeuda = isPaid ? Math.max(0, Number(p.deuda_restante || 0) - Number(p.cuota_mensual || 0)) : Number(p.deuda_restante || 0);
    return s + actualDeuda;
  }, 0);

  const activeMovimientos = [...transaccionesAdicionales, ...movimientos];

  const quickActions = [
    { icon: '↗', label: 'Transferir', color: '#EEF3FB', text: '#004481', key: 'transferir' },
    { icon: '💳', label: 'Préstamo', color: '#FEF3C7', text: '#92400E', key: 'prestamo' },
    { icon: '📲', label: 'Recargar', color: '#E6F7F0', text: '#0F6E56', key: 'recargar' },
    { icon: '📄', label: 'Extracto', color: '#F5F0FF', text: '#5B21B6', key: 'extracto' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans">
      {/* ── ALERTA ENTORNO ACADÉMICO / SIMULACIÓN ── */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-[12px] font-bold shadow-sm relative z-50 flex items-center justify-center gap-2">
        <span>🎓</span>
        <span>ATENCIÓN: Este sitio es una SIMULACIÓN ACADÉMICA de banca por internet para un proyecto de la Universidad. No es un banco real.</span>
      </div>

      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#E6F7F0] border border-[#0F6E56]/20 text-[#0F6E56] px-5 py-3.5 rounded-xl shadow-2xl text-[13px] font-semibold flex items-center gap-2.5 transition-all">
          <span className="text-[18px]">✅</span>
          {toastMessage.text}
        </div>
      )}
      {/* NAVBAR */}
      <nav className="bg-[#004481] h-[60px] px-6 flex items-center justify-between shadow-md">
        <EkuBankLogo size={140} color="#ffffff" withDot />
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-full bg-white/15 flex items-center justify-center text-white text-[13px] font-bold">{initials}</div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[11px] text-white/60">Bienvenido</span>
            <span className="text-[13px] font-semibold text-white">{user?.nombre}</span>
          </div>
          <button onClick={onLogout}
            className="bg-white/10 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-[12px] font-semibold ml-3 transition-colors border border-white/20 hover:border-red-600">
            Salir
          </button>
        </div>
      </nav>

      <main className="max-w-[900px] mx-auto px-5 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-[22px] font-bold text-[#072146] tracking-tight">Mis cuentas</h1>
          <p className="text-[12px] text-gray-400 mt-0.5 capitalize">{today}</p>
        </motion.div>

        {/* BANNER DE ALERTAS DE SEGURIDAD */}
        {securityAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3">
                <span className="text-[20px] shrink-0">⚠️</span>
                <div>
                  <h3 className="text-[13.5px] font-bold text-red-800">Alerta de Seguridad: Intentos de Acceso No Autorizados</h3>
                  <p className="text-[12px] text-red-700/95 mt-1 leading-relaxed">
                    Hemos detectado <strong>{securityAlerts.length}</strong> intento(s) fallido(s) de inicio de sesión en tu cuenta recientemente. Si no fuiste tú, por favor considera cambiar tu contraseña por seguridad.
                  </p>
                  <div className="mt-3 space-y-2 max-h-[140px] overflow-y-auto">
                    {securityAlerts.map((alert, idx) => (
                      <div key={alert.id || idx} className="text-[11px] bg-red-100/50 text-red-800 px-3 py-2 rounded-lg border border-red-200/40">
                        • El <strong>{alert.fecha_formateada}</strong> desde la IP <strong>{alert.ip_address}</strong> usando <strong>{alert.user_agent}</strong>.
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSecurityAlerts([])}
                className="text-red-600 hover:text-red-900 text-[11px] font-bold bg-red-100 hover:bg-red-200/60 px-3 py-1.5 rounded-md transition-colors shrink-0"
              >
                Cerrar Aviso
              </button>
            </div>
          </motion.div>
        )}

        {/* FILA DE TARJETAS (SALDO Y SCORE) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* TARJETA DE SALDO */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#004481] to-[#1565C0] rounded-[20px] p-6 relative overflow-hidden flex flex-col justify-between h-[210px] w-full">
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute bottom-[-60px] left-16 w-40 h-40 rounded-full bg-white/[0.04] pointer-events-none" />
            <div className="relative z-10 flex flex-col justify-between h-full w-full">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-[1px] mb-0.5">Cuenta Independencia</p>
                  <p className="text-[12px] text-white/75 font-mono">{cuenta}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#49D0A0]/20 text-[#49D0A0] text-[10px] font-bold px-2 py-0.5 rounded-full">Activa</span>
                  <button onClick={() => setShowSaldo(!showSaldo)}
                    className="text-white/50 hover:text-white/90 transition-colors text-[10.5px] font-semibold bg-white/10 px-2 py-0.5 rounded">
                    {showSaldo ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-[0.8px] mb-0.5">Saldo disponible</p>
                <AnimatePresence mode="wait">
                  {showSaldo ? (
                    <motion.p key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[32px] font-bold text-white tracking-tight font-mono leading-none">
                      <span className="text-[18px] font-normal opacity-70 mr-1">S/</span>
                      {isLoadingData ? '—' : saldoNum.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </motion.p>
                  ) : (
                    <motion.p key="hide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-[32px] font-bold text-white tracking-[0.2em] leading-none">•••••••</motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex justify-between items-end">
                {deudaTotal > 0 ? (
                  <p className="text-[10px] text-[#F0AD4E]">Deuda activa: S/ {deudaTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                ) : (
                  <p className="text-[10px] text-white/30">Sin deudas activas</p>
                )}
                <p className="text-[10px] text-white/40">DNI: {user?.dni}</p>
              </div>
            </div>
          </motion.div>

          {/* TARJETA DE SCORE CREDITICIO */}
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }}
            className="bg-white border border-[#EAECF0] rounded-[20px] p-6 relative overflow-hidden flex flex-col justify-between h-[210px] w-full shadow-sm">
            <div className="relative z-10 flex flex-col justify-between h-full w-full">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-[1px] font-semibold">Salud Financiera</p>
                  <p className="text-[12px] text-gray-500 font-bold">Score Crediticio EkuBank</p>
                </div>
                <div>
                  {score >= 750 && <span className="bg-[#E6F7F0] text-[#0F6E56] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">Excelente</span>}
                  {score >= 600 && score < 750 && <span className="bg-[#EEF3FB] text-[#004481] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">Normal</span>}
                  {score >= 450 && score < 600 && <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">Riesgo (CPP)</span>}
                  {score < 450 && <span className="bg-red-50 text-[#DC2626] text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">Crítico</span>}
                </div>
              </div>

              <div className="my-1">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.8px] mb-0.5">Puntaje de crédito</p>
                <div className="flex items-baseline leading-none">
                  <span className="text-[34px] font-black text-[#072146] font-mono leading-none">{score}</span>
                  <span className="text-[14px] text-gray-400 ml-1 font-semibold">/ 850 pts</span>
                </div>
              </div>

              <div>
                <div className="h-2 bg-[#F0F2F5] rounded-full overflow-hidden w-full relative">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${((score - 300) / 550 * 100).toFixed(0)}%`,
                      backgroundColor: score >= 750 ? '#0D9E75' : score >= 600 ? '#1973B8' : score >= 450 ? '#D97706' : '#DC2626'
                    }} 
                  />
                </div>
                <div className="flex justify-between text-[8px] text-gray-300 font-bold uppercase mt-1">
                  <span>Mín: 300</span>
                  <span>Máx: 850</span>
                </div>
              </div>

              <p className="text-[10.5px] text-gray-500 leading-snug">
                {score >= 750 && "¡Excelente! Mantienes tus cuotas al día. Tienes acceso preferencial a mejores tasas."}
                {score >= 600 && score < 750 && "Buen comportamiento crediticio. Tu calificación en el sistema es Normal."}
                {score >= 450 && score < 600 && "¡Alerta! Registras atrasos de pago. Cancela tus cuotas para evitar reportes SBS."}
                {score < 450 && "Tu score se encuentra afectado por morosidad crítica. Regulariza tus pagos pronto."}
              </p>
            </div>
          </motion.div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3 mb-5">
          {quickActions.map((a) => (
            <button key={a.key} onClick={() => togglePanel(a.key)}
              className={`flex flex-col items-center gap-2 rounded-[14px] py-4 px-2 border transition-all ${
                activePanel === a.key
                  ? 'bg-[#004481] border-[#004481] shadow-lg shadow-[#004481]/20'
                  : 'bg-white border-[#EAECF0] hover:shadow-md hover:-translate-y-0.5'
              }`}>
              <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[18px] transition-all ${
                activePanel === a.key ? 'bg-white/20' : ''
              }`} style={activePanel === a.key ? {} : { background: a.color, color: a.text }}>
                {a.icon}
              </div>
              <span className={`text-[11px] font-semibold ${activePanel === a.key ? 'text-white' : 'text-[#1A2B4A]'}`}>{a.label}</span>
            </button>
          ))}
        </motion.div>

        {/* PANELES FUNCIONALES */}
        <AnimatePresence mode="wait">
          {activePanel === 'transferir' && (
            <PanelTransferir key="transferir" userDni={user?.dni} userToken={user?.token} saldoDisponible={saldoNum} onDone={handleOperationDone} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'recargar' && (
            <PanelRecargar key="recargar" userDni={user?.dni} userToken={user?.token} saldoDisponible={saldoNum} onDone={handleOperationDone} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'extracto' && (
            <PanelExtracto key="extracto" userDni={user?.dni} userToken={user?.token} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'prestamo' && (
            <Prestamo key="prestamo" userDni={user?.dni} userToken={user?.token} onClose={() => setActivePanel(null)} onSuccess={() => setTimeout(fetchDashboard, 1000)} />
          )}
        </AnimatePresence>

        {/* MIS PRÉSTAMOS */}
        {prestamos.length > 0 && !activePanel && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-[#EAECF0] flex items-center justify-between">
              <p className="text-[13px] font-bold text-[#072146]">Mis préstamos</p>
              <span className="text-[11px] text-gray-400">{prestamos.length} solicitud{prestamos.length > 1 ? 'es' : ''}</span>
            </div>
            <div className="divide-y divide-[#F5F7FA]">
              {prestamos.map((pr) => {
                const ec = estadoColors[pr.estado] || estadoColors.pendiente;
                const isPaidThisMonth = !!pr.pagado_este_mes || pagosRealizados.includes(pr.codigo);
                
                const cuotasPagadas = Number(pr.cuotas_pagadas || 0) + (pagosRealizados.includes(pr.codigo) && !pr.pagado_este_mes ? 1 : 0);
                const cuotasRest = Math.max(0, Number(pr.cuotas_restantes || 0) - (pagosRealizados.includes(pr.codigo) && !pr.pagado_este_mes ? 1 : 0));
                const deuda = Math.max(0, Number(pr.deuda_restante || 0) - (pagosRealizados.includes(pr.codigo) && !pr.pagado_este_mes ? Number(pr.cuota_mensual || 0) : 0));

                let statusInfo = { status: 'aldia', label: 'Al día', color: '#059669', bg: '#D1FAE5', mora: 0, diasAtraso: 0, paymentDay: pr.dia_pago || 15, paymentText: `Día de pago: el día ${pr.dia_pago || 15} de cada mes.`, totalAPagar: Number(pr.cuota_mensual || 0) };
                if (pr.estado === 'aprobado') {
                  if (cuotasRest === 0) {
                    statusInfo = { status: 'pagado', label: 'Cancelado', color: '#059669', bg: '#D1FAE5', mora: 0, diasAtraso: 0, paymentDay: pr.dia_pago || 15, paymentText: '¡Felicidades! Préstamo cancelado en su totalidad.', totalAPagar: 0 };
                  } else if (isPaidThisMonth) {
                    statusInfo = { status: 'pagado_mes', label: 'Al día', color: '#059669', bg: '#D1FAE5', mora: 0, diasAtraso: 0, paymentDay: pr.dia_pago || 15, paymentText: pr.fecha_siguiente_pago ? `Próximo pago: ${pr.fecha_siguiente_pago}` : '¡La cuota del presente mes ha sido saldada!', totalAPagar: 0 };
                  } else {
                    statusInfo = getLoanStatus(pr);
                  }
                }

                return (
                  <div key={pr.codigo} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-bold text-[#072146] font-mono">PRE-{String(pr.codigo).padStart(6, '0')}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ec.bg, color: ec.text }}>{ec.label}</span>
                        </div>
                        <p className="text-[11px] text-gray-400">{pr.proposito || 'Sin propósito'} · Solicitado {pr.fecha_solicitud}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[16px] font-bold text-[#072146]">S/ {Number(pr.monto).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">{pr.plazo_meses} meses · {(Number(pr.tasa_anual) * 100).toFixed(2)}% TEA</p>
                      </div>
                    </div>

                    {pr.estado === 'aprobado' && (
                      <div className="bg-[#F7F8FA] rounded-xl p-3 mt-2">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div>
                            <p className="text-[10px] text-gray-400">Cuota mensual</p>
                            <p className="text-[14px] font-bold text-[#004481]">S/ {Number(pr.cuota_mensual).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Cuotas restantes</p>
                            <p className="text-[14px] font-bold text-[#92400E]">{cuotasRest} de {pr.plazo_meses}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">Deuda restante</p>
                            <p className="text-[14px] font-bold text-[#DC2626]">S/ {deuda.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                          </div>
                        </div>
                        {/* Barra de progreso */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>Progreso de pago</span>
                            <span>{cuotasPagadas} de {pr.plazo_meses} cuotas</span>
                          </div>
                          <div className="h-2 bg-[#E0E6ED] rounded-full overflow-hidden">
                            <div className="h-full bg-[#49D0A0] rounded-full transition-all" style={{ width: `${((cuotasPagadas / pr.plazo_meses) * 100).toFixed(0)}%` }} />
                          </div>
                        </div>

                        {/* Estado detallado del pago */}
                        <div className="mt-3.5 pt-3.5 border-t border-[#EAECF0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: statusInfo.color }} />
                            <div>
                              <p className="text-[11px] font-bold text-[#072146] flex items-center gap-1.5">
                                {statusInfo.label}
                                {statusInfo.mora > 0 && <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[9px] font-bold">Mora: S/ {statusInfo.mora.toFixed(2)}</span>}
                              </p>
                              <p className="text-[10px] text-gray-400">{statusInfo.paymentText}</p>
                            </div>
                          </div>
                          
                          {/* Botón Pagar Cuota */}
                          {!isPaidThisMonth && cuotasRest > 0 && (statusInfo.status === 'mora' || statusInfo.status === 'vence_hoy' || statusInfo.status === 'proximo' || statusInfo.status === 'aldia') && (
                            <button
                              onClick={() => handlePagarCuota(pr, statusInfo)}
                              className="bg-[#004481] hover:bg-[#1565C0] text-white text-[10.5px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 self-end sm:self-auto hover:shadow-md"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                                <line x1="2" y1="10" x2="22" y2="10" />
                              </svg>
                              Pagar Cuota (S/ {statusInfo.totalAPagar.toFixed(2)})
                            </button>
                          )}
                        </div>

                        {/* Botones de acción / Accordion */}
                        <div className="mt-3.5 pt-3 border-t border-[#EAECF0] flex items-center justify-between">
                          <button
                            onClick={() => setExpandedCronograma(expandedCronograma === pr.codigo ? null : pr.codigo)}
                            className="text-[#004481] hover:text-[#1565C0] text-[10.5px] font-bold flex items-center gap-1 transition-colors"
                          >
                            <span>{expandedCronograma === pr.codigo ? 'Ocultar cronograma' : 'Ver cronograma de pagos'}</span>
                            <svg
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedCronograma === pr.codigo ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        </div>

                        {/* Acordeón del Cronograma */}
                        <AnimatePresence>
                          {expandedCronograma === pr.codigo && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-3 pt-3 border-t border-[#EAECF0] overflow-hidden"
                            >
                              <p className="text-[11px] font-bold text-[#072146] mb-2">Cronograma de Cuotas (TEA {(Number(pr.tasa_anual) * 100).toFixed(2)}%)</p>
                              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                                {generateCronograma(pr, cuotasPagadas).map((c) => (
                                  <div key={c.n} className="flex items-center justify-between text-[11.5px] bg-[#FAFBFD] p-2 rounded-lg border border-[#F2F4F7]">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-500">N° {c.n}</span>
                                      <span className="text-[9.5px] px-1.5 py-0.5 rounded-md font-bold" style={{ backgroundColor: c.statusBg, color: c.statusColor }}>
                                        {c.statusLabel}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                      <div>
                                        <p className="text-gray-400 text-[8px] uppercase">Vencimiento</p>
                                        <p className="text-gray-600 font-semibold text-[10px]">{c.fechaVencimiento}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-400 text-[8px] uppercase">Total Cuota</p>
                                        <p className="text-[#072146] font-bold text-[10px]">S/ {c.total.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {pr.estado === 'pendiente' && (
                      <div className="bg-[#FEF3C7]/50 rounded-xl p-3 mt-2 flex items-center gap-2">
                        <span className="text-[14px]">⏳</span>
                        <p className="text-[11px] text-[#92400E]">Tu solicitud está siendo evaluada por un asesor financiero. Recibirás una respuesta pronto.</p>
                      </div>
                    )}

                    {pr.estado === 'rechazado' && (
                      <div className="bg-red-50/50 rounded-xl p-3 mt-2">
                        <p className="text-[11px] text-[#DC2626]">Solicitud rechazada{pr.fecha_evaluacion ? ` el ${pr.fecha_evaluacion}` : ''}.</p>
                        {pr.observacion && <p className="text-[11px] text-gray-500 mt-1 italic">Motivo: {pr.observacion}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* BANNER PRÉSTAMO */}
        {!activePanel && prestamosActivos.length === 0 && prestamosPendientes.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-[#49D0A0]/15 to-[#1973B8]/10 rounded-[16px] border border-[#49D0A0]/30 p-4 flex items-center justify-between mb-5">
            <div>
              <p className="text-[13px] font-bold text-[#072146]">¿Necesitas un préstamo?</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Desde 40.92% TEA · Respuesta en 24h</p>
            </div>
            <button onClick={() => setActivePanel('prestamo')}
              className="bg-[#004481] text-white px-4 py-2 rounded-[10px] text-[12px] font-semibold hover:bg-[#1565C0] transition-colors whitespace-nowrap">
              Solicitar →
            </button>
          </motion.div>
        )}

        {/* ÚLTIMOS MOVIMIENTOS */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAECF0] flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#072146]">Últimos movimientos</p>
            <span className="text-[11px] text-gray-400">{activeMovimientos.length > 0 ? `${activeMovimientos.length} operaciones` : ''}</span>
          </div>
          <div className="divide-y divide-[#F5F7FA]">
            {isLoadingData ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                  <div className="w-9 h-9 rounded-[10px] bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5"><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-2.5 bg-gray-100 rounded w-1/4" /></div>
                  <div className="h-3.5 bg-gray-100 rounded w-16" />
                </div>
              ))
            ) : activeMovimientos.length === 0 ? (
              <div className="text-center py-10"><p className="text-[13px] text-gray-400">No hay movimientos registrados aún.</p></div>
            ) : (
              activeMovimientos.map((tx, i) => {
                const cat = categoryStyle[tx.category] || categoryStyle.shop;
                const isPos = parseFloat(tx.amount) > 0;
                return (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFBFC] transition-colors">
                    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[15px] shrink-0"
                      style={{ background: cat.bg, color: cat.color }}>{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1A2B4A] truncate">{tx.name}</p>
                      <p className="text-[11px] text-gray-400 capitalize">{tx.date}</p>
                    </div>
                    <span className="text-[13px] font-bold font-mono shrink-0" style={{ color: isPos ? '#0F6E56' : '#DC2626' }}>
                      {isPos ? '+' : ''}S/ {Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {alertData && (
          <div className="fixed inset-0 bg-[#072146]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-2xl p-6 w-full max-w-[400px] text-center">
              <svg className="w-14 h-14 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-[18px] font-bold text-[#072146] mb-2">{alertData.title}</h3>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">{alertData.message}</p>
              <button onClick={() => setAlertData(null)}
                className="w-full h-11 bg-[#004481] hover:bg-[#1565C0] text-white font-semibold rounded-[10px] transition-colors">
                Entendido
              </button>
            </motion.div>
          </div>
        )}

        {loanConfirmData && (
          <div className="fixed inset-0 bg-[#072146]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-2xl overflow-hidden w-full max-w-[420px]">
              <div className="bg-gradient-to-r from-[#004481] to-[#1565C0] px-6 py-4 text-white">
                <p className="text-[10px] uppercase tracking-[1.2px] font-semibold opacity-75">Confirmación de Pago</p>
                <h3 className="text-[15px] font-bold">Pago de Cuota Préstamo</h3>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-[#EEF3FB] text-[#004481] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-[13px] text-center text-gray-500 mb-5">Por favor, confirma los detalles para proceder con el pago de la cuota:</p>
                <div className="bg-[#F8FAFC] border border-[#E0E6ED] rounded-[12px] p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">Préstamo ID</span>
                    <span className="font-bold text-[#072146] font-mono">PRE-{String(loanConfirmData.pr.codigo).padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-gray-400 font-medium">Cuota mensual</span>
                    <span className="font-semibold text-gray-600">S/ {Number(loanConfirmData.pr.cuota_mensual).toFixed(2)}</span>
                  </div>
                  {loanConfirmData.status.mora > 0 && (
                    <div className="flex justify-between items-center text-[12px]">
                      <span className="text-red-500 font-medium flex items-center gap-1">
                        Mora por atraso ({loanConfirmData.status.diasAtraso} días)
                      </span>
                      <span className="font-bold text-red-600 font-mono">S/ {loanConfirmData.status.mora.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#E0E6ED] pt-3 flex justify-between items-center">
                    <span className="text-[12px] text-[#004481] font-bold uppercase tracking-[0.5px]">Total a Debitar</span>
                    <span className="text-[18px] font-black text-[#004481] font-mono">S/ {loanConfirmData.status.totalAPagar.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setLoanConfirmData(null)}
                    className="flex-1 h-11 border-[1.5px] border-[#E0E6ED] text-[#004481] hover:bg-[#F0F5FB] text-[13px] font-semibold rounded-[10px] transition-all">
                    Cancelar
                  </button>
                  <button type="button" onClick={() => executePagarCuota(loanConfirmData.pr, loanConfirmData.status)}
                    className="flex-1 h-11 bg-[#004481] hover:bg-[#1565C0] text-white text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg">
                    Confirmar Pago
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
