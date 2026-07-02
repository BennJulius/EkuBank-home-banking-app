import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import Prestamo from '../Prestamo';
import EkuBankLogo from '../EkuBankLogo';

const API = 'https://ekubank.ekubyte.net.pe/api/controllers/TransferController.php';

const categoryStyle = {
  shop:  { bg: '#EEF3FB', color: '#004481' },
  bank:  { bg: '#E6F7F0', color: '#0F6E56' },
  phone: { bg: '#FEF3C7', color: '#92400E' },
  play:  { bg: '#F5F0FF', color: '#5B21B6' },
};

const renderCategoryIcon = (classification, categoryKey, className = "w-4 h-4") => {
  if (classification === 'prestamos') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (classification === 'recargas') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (classification === 'transferencias') {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    );
  }
  switch (categoryKey) {
    case 'bank':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    case 'phone':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'play':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'shop':
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
  }
};

const renderFilterIcon = (key, className = "w-4 h-4") => {
  switch (key) {
    case 'todos':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    case 'transferencias':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case 'prestamos':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'recargas':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'otros':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    default:
      return null;
  }
};

const downloadReceipt = (txDetails) => {
  const element = document.createElement("a");
  const receiptId = txDetails.id || `CCI-${Math.floor(100000000 + Math.random() * 900000000)}`;
  const content = `====================================================
                  EKUBANK PERÚ
              CONSTANCIA DE OPERACIÓN
====================================================
Fecha: ${txDetails.date || new Date().toLocaleString('es-PE')}
Tipo de operación: ${txDetails.type || 'Pago/Transferencia'}
Operación ID: ${receiptId}
Canal de operación: ${txDetails.canal || 'Banca por Internet'}
Estado: PROCESADO - EXITOSO
----------------------------------------------------
Detalle: ${txDetails.description}
Monto: S/ ${Math.abs(Number(txDetails.amount || 0)).toFixed(2)}
----------------------------------------------------
¡Gracias por confiar en EkuBank!
====================================================`;
  const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
  element.href = URL.createObjectURL(file);
  element.download = `Constancia_EkuBank_${receiptId}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

const renderActionIcon = (key, className = "w-5 h-5") => {
  switch (key) {
    case 'transferir':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      );
    case 'prestamo':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'recargar':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case 'extracto':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    case 'servicios':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    default:
      return null;
  }
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

  const [tokenStep, setTokenStep] = useState('details'); // 'details' | 'token'
  const [simulatedToken, setSimulatedToken] = useState('');
  const [userTokenInput, setUserTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');

  const handleProceedToToken = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedToken(randomCode);
    setTokenStep('token');
    setUserTokenInput('');
    setTokenError('');
  };

  const handleFinalConfirm = () => {
    if (userTokenInput !== simulatedToken) {
      setTokenError('Token Digital incorrecto. Por favor, verifica el código.');
      return;
    }
    executeTransfer();
  };

  const handleDestino = (e) => {
    const v = e.target.value.replace(/[^0-9-]/g, '');
    if (v.length <= 15) setDniDestino(v);
  };

  const submit = (e) => {
    e.preventDefault();
    const limpio = dniDestino.replace(/-/g, '');
    if (limpio.length < 8) {
      setMsg('Ingresa un DNI (8 dígitos) o número de cuenta válido (Ej. 019-1234567).');
      return;
    }
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
            <Field label="DNI o Número de cuenta del destinatario">
              <input type="text" placeholder="Ej. 12345678 o 019-1234567" value={dniDestino} onChange={handleDestino} maxLength={15} required className={inputClass} />
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
                {tokenStep === 'details' ? (
                  <>
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
                        <span className="text-gray-400 font-medium">Destinatario (DNI/Cuenta)</span>
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
                      <button type="button" onClick={handleProceedToToken}
                        className="flex-1 h-11 bg-[#004481] hover:bg-[#1565C0] text-white text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer">
                        Confirmar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#E6F7F0] text-[#0F6E56] flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-[13px] text-center text-gray-500 mb-4">Se requiere autorización con tu **Token Digital** de seguridad:</p>
                    
                    {/* Simulador de token de celular */}
                    <div className="bg-[#FEF3C7] border border-[#D97706]/20 rounded-xl p-3 mb-4 text-[11px] text-[#92400E]">
                      <p className="font-bold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Token Digital autogenerado en tu celular:
                      </p>
                      <p className="text-[16px] font-black text-center mt-1 tracking-[0.2em] font-mono bg-white/60 py-1 rounded">
                        {simulatedToken.substring(0, 3)} {simulatedToken.substring(3)}
                      </p>
                    </div>

                    <div className="space-y-3 mb-5">
                      <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[0.5px] uppercase">Introduce el código del Token</label>
                      <input 
                        type="text" 
                        placeholder="Escribe los 6 dígitos" 
                        maxLength={6} 
                        value={userTokenInput}
                        onChange={(e) => setUserTokenInput(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center text-[16px] font-bold tracking-[0.1em] font-mono h-11 border-[1.5px] border-[#E0E6ED] rounded-[10px] outline-none focus:border-[#004481]"
                      />
                      {tokenError && <p className="text-red-600 text-[11px] font-medium text-center">{tokenError}</p>}
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setTokenStep('details'); setTokenError(''); }}
                        className="flex-1 h-11 border-[1.5px] border-[#E0E6ED] text-[#004481] hover:bg-[#F0F5FB] text-[13px] font-semibold rounded-[10px] transition-all">
                        Atrás
                      </button>
                      <button type="button" onClick={handleFinalConfirm} disabled={loading}
                        className="flex-1 h-11 bg-[#004481] hover:bg-[#1565C0] text-white text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer">
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar y Transferir'}
                      </button>
                    </div>
                  </>
                )}
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

const PanelServicios = ({ userDni, userToken, saldoDisponible, onDone, onClose }) => {
  const [servicio, setServicio] = useState('Enel (Luz)');
  const [suministro, setSuministro] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [alertData, setAlertData] = useState(null);

  const [tokenStep, setTokenStep] = useState('details'); // 'details' | 'token'
  const [simulatedToken, setSimulatedToken] = useState('');
  const [userTokenInput, setUserTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [receiptDetails, setReceiptDetails] = useState(null);

  const getMontoServicio = (serv) => {
    if (serv.includes('Luz')) return 84.60;
    if (serv.includes('Agua')) return 42.10;
    return 119.90; // Internet
  };

  const submit = (e) => {
    e.preventDefault();
    if (suministro.length < 6) {
      setMsg('El código de suministro/cliente debe tener al menos 6 dígitos.');
      return;
    }
    const m = getMontoServicio(servicio);
    if (m > saldoDisponible) {
      setAlertData({
        title: 'Saldo Insuficiente',
        message: `No tienes saldo suficiente para pagar S/ ${m.toFixed(2)}. Tu saldo disponible es S/ ${saldoDisponible.toFixed(2)}.`
      });
      return;
    }
    setConfirmData({
      servicio,
      suministro,
      monto: m
    });
    setTokenStep('details');
  };

  const handleProceedToToken = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedToken(randomCode);
    setTokenStep('token');
    setUserTokenInput('');
    setTokenError('');
  };

  const executePagoServicio = async () => {
    if (userTokenInput !== simulatedToken) {
      setTokenError('Token Digital incorrecto. Por favor, verifica el código.');
      return;
    }

    setLoading(true); setMsg('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pago_servicio',
          token: userToken,
          dni: userDni,
          servicio: confirmData.servicio,
          suministro: confirmData.suministro,
          monto: confirmData.monto
        })
      });
      const data = await res.json();
      setMsg(data.message); setOk(data.success);
      if (data.success) {
        onDone(data.nuevo_saldo);
        setReceiptDetails({
          id: `CCI-${Math.floor(100000000 + Math.random() * 900000000)}`,
          date: new Date().toLocaleString('es-PE'),
          type: 'Pago de Servicio',
          description: `Pago de Servicio ${confirmData.servicio} - Suministro: ${confirmData.suministro}`,
          amount: -confirmData.monto,
          canal: 'Banca por Internet'
        });
      }
    } catch {
      setMsg('Error de conexión.');
    } finally {
      setLoading(false);
      setConfirmData(null);
    }
  };

  return (
    <>
      <Panel title="Pago de Servicios" subtitle="Luz, agua y telecomunicaciones" icon="⚡" color="#E53E3E" onClose={onClose}>
        {ok ? (
          <div className="text-center py-6 px-4">
            <div className="w-14 h-14 rounded-full bg-[#E6F7F0] text-[#0F6E56] flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-[16px] font-bold text-[#072146] mb-2">Pago Realizado Exitosamente</h4>
            <p className="text-[12.5px] text-gray-500 mb-6">{msg}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => downloadReceipt(receiptDetails)}
                className="h-11 bg-[#004481] hover:bg-[#1565C0] text-white text-[13px] font-bold px-5 rounded-[10px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar Constancia
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-11 border border-[#E0E6ED] text-[#004481] hover:bg-gray-50 text-[13px] font-bold px-5 rounded-[10px] transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Selecciona Empresa/Servicio">
              <div className="grid grid-cols-3 gap-2">
                {['Enel (Luz)', 'Sedapal (Agua)', 'Claro/Movistar'].map((serv) => (
                  <button key={serv} type="button" onClick={() => setServicio(serv)}
                    className={`py-2.5 rounded-[10px] text-[12px] font-semibold border-[1.5px] transition-all cursor-pointer ${
                      servicio === serv ? 'bg-[#004481] border-[#004481] text-white' : 'bg-[#F8FAFC] border-[#E0E6ED] text-[#1A2B4A] hover:border-[#1973B8]'
                    }`}>{serv}</button>
                ))}
              </div>
            </Field>

            <Field label="Código de Suministro / Cliente">
              <input type="text" inputMode="numeric" placeholder="Ej. 12345678" value={suministro}
                onChange={(e) => setSuministro(e.target.value.replace(/[^0-9]/g, ''))}
                required className={inputClass} />
            </Field>

            <div className="bg-[#EEF3FB] border border-[#004481]/10 rounded-xl p-3.5 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-[#004481] uppercase font-semibold">Total a Pagar (Deuda Pendiente)</p>
                <p className="text-[17px] font-black text-[#004481] font-mono mt-0.5">S/ {getMontoServicio(servicio).toFixed(2)}</p>
              </div>
              <span className="bg-[#EEF3FB] border border-[#004481]/25 text-[#004481] text-[9.5px] font-extrabold px-2 py-0.5 rounded-full uppercase">Al Día</span>
            </div>

            {msg && <p className="text-red-600 text-[12px] font-medium text-center">{msg}</p>}
            <BtnSubmit loading={loading} label="Consultar y Pagar" />
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
              <button type="button" onClick={() => setAlertData(null)}
                className="w-full h-11 bg-[#004481] hover:bg-[#1565C0] text-white font-semibold rounded-[10px] transition-colors cursor-pointer">
                Entendido
              </button>
            </motion.div>
          </div>
        )}

        {confirmData && (
          <div className="fixed inset-0 bg-[#072146]/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[20px] border border-[#EAECF0] shadow-2xl overflow-hidden w-full max-w-[420px]">
              <div className="bg-gradient-to-r from-[#E53E3E] to-[#FC8181] px-6 py-4 text-white">
                <p className="text-[10px] uppercase tracking-[1.2px] font-semibold opacity-75">Confirmación de Operación</p>
                <h3 className="text-[15px] font-bold">Pago de Servicio Público</h3>
              </div>
              <div className="p-6">
                {tokenStep === 'details' ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#FFF3F3] text-[#E53E3E] flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-[13px] text-center text-gray-500 mb-5">Por favor, confirma los detalles del pago de servicio:</p>
                    <div className="bg-[#F8FAFC] border border-[#E0E6ED] rounded-[12px] p-4 mb-6 space-y-3">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-400 font-medium">Servicio</span>
                        <span className="font-bold text-[#072146]">{confirmData.servicio}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-gray-400 font-medium">Suministro</span>
                        <span className="font-bold text-[#072146] font-mono">{confirmData.suministro}</span>
                      </div>
                      <div className="border-t border-[#E0E6ED] pt-3 flex justify-between items-center">
                        <span className="text-[12px] text-[#E53E3E] font-bold uppercase tracking-[0.5px]">Monto a Debitar</span>
                        <span className="text-[18px] font-black text-[#E53E3E] font-mono">S/ {confirmData.monto.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setConfirmData(null)}
                        className="flex-1 h-11 border-[1.5px] border-[#E0E6ED] text-[#004481] hover:bg-[#F0F5FB] text-[13px] font-semibold rounded-[10px] transition-all cursor-pointer">
                        Cancelar
                      </button>
                      <button type="button" onClick={handleProceedToToken}
                        className="flex-1 h-11 bg-[#E53E3E] hover:bg-[#C53030] text-white text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer">
                        Confirmar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#E6F7F0] text-[#0F6E56] flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <p className="text-[13px] text-center text-gray-500 mb-4">Se requiere autorización con tu **Token Digital** de seguridad:</p>
                    
                    <div className="bg-[#FEF3C7] border border-[#D97706]/20 rounded-xl p-3 mb-4 text-[11px] text-[#92400E]">
                      <p className="font-bold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Token Digital autogenerado en tu celular:
                      </p>
                      <p className="text-[16px] font-black text-center mt-1 tracking-[0.2em] font-mono bg-white/60 py-1 rounded">
                        {simulatedToken.substring(0, 3)} {simulatedToken.substring(3)}
                      </p>
                    </div>

                    <div className="space-y-3 mb-5">
                      <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[0.5px] uppercase">Introduce el código del Token</label>
                      <input 
                        type="text" 
                        placeholder="Escribe los 6 dígitos" 
                        maxLength={6} 
                        value={userTokenInput}
                        onChange={(e) => setUserTokenInput(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full text-center text-[16px] font-bold tracking-[0.1em] font-mono h-11 border-[1.5px] border-[#E0E6ED] rounded-[10px] outline-none focus:border-[#004481]"
                      />
                      {tokenError && <p className="text-red-600 text-[11px] font-medium text-center">{tokenError}</p>}
                    </div>

                    <div className="flex gap-3">
                      <button type="button" onClick={() => { setTokenStep('details'); setTokenError(''); }}
                        className="flex-1 h-11 border-[1.5px] border-[#E0E6ED] text-[#004481] hover:bg-[#F0F5FB] text-[13px] font-semibold rounded-[10px] transition-all cursor-pointer">
                        Atrás
                      </button>
                      <button type="button" onClick={executePagoServicio} disabled={loading}
                        className="flex-1 h-11 bg-[#004481] hover:bg-[#1565C0] text-white text-[13px] font-semibold rounded-[10px] transition-all flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer">
                        {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirmar y Pagar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── PANEL: Extracto ───
const getTxClassification = (tx) => {
  const name = (tx.name || '').toLowerCase();
  if (name.includes('transferencia')) return 'transferencias';
  if (name.includes('préstamo') || name.includes('prestamo') || name.includes('pre-')) return 'prestamos';
  if (name.includes('recarga')) return 'recargas';
  return 'otros';
};

const PanelExtracto = ({ userDni, userToken, onClose }) => {
  const [txs, setTxs] = useState([]);
  const [resumen, setResumen] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [expandedTxIndex, setExpandedTxIndex] = useState(null);

  const handleFilterClick = (key) => {
    setActiveFilter(key);
    setExpandedTxIndex(null);
  };

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

  const filteredTxs = txs.filter(tx => {
    if (activeFilter === 'todos') return true;
    return getTxClassification(tx) === activeFilter;
  });

  return (
    <Panel title="Historial de movimientos" subtitle="Detalle y clasificación" icon="📄" color="#5B21B6" onClose={onClose}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#F0F2F5] rounded-[10px] p-2.5 text-center">
          <p className="text-[10px] text-gray-400 font-medium">Operaciones</p>
          <p className="text-[16px] font-bold text-[#072146]">{resumen.total_operaciones || 0}</p>
        </div>
        <div className="bg-[#E6F7F0] rounded-[10px] p-2.5 text-center">
          <p className="text-[10px] text-[#0F6E56]/60 font-medium">Ingresos</p>
          <p className="text-[14px] font-bold text-[#0F6E56]">S/ {totalIng.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-red-50 rounded-[10px] p-2.5 text-center">
          <p className="text-[10px] text-red-400 font-medium">Egresos</p>
          <p className="text-[14px] font-bold text-[#DC2626]">S/ {totalEgr.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Clasificación de Filtros */}
      <div className="flex flex-wrap gap-1 mb-4 bg-[#F2F4F7] p-1 rounded-xl border border-[#EAECF0]">
        {[
          { key: 'todos', label: 'Todos' },
          { key: 'transferencias', label: 'Transf.' },
          { key: 'prestamos', label: 'Préstamos' },
          { key: 'recargas', label: 'Recargas' },
          { key: 'otros', label: 'Otros' }
        ].map(filter => {
          const count = filter.key === 'todos' 
            ? txs.length 
            : txs.filter(t => getTxClassification(t) === filter.key).length;
          
          return (
            <button
              key={filter.key}
              onClick={() => handleFilterClick(filter.key)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all flex-1 justify-center ${
                activeFilter === filter.key
                  ? 'bg-white text-[#5B21B6] shadow-sm'
                  : 'text-gray-500 hover:text-[#5B21B6]'
              }`}
            >
              {renderFilterIcon(filter.key, activeFilter === filter.key ? "w-3.5 h-3.5 text-[#5B21B6]" : "w-3.5 h-3.5 text-gray-400")}
              <span>{filter.label}</span>
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  activeFilter === filter.key ? 'bg-[#5B21B6]/15 text-[#5B21B6]' : 'bg-gray-200 text-gray-600'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-6"><span className="w-6 h-6 border-2 border-[#004481]/20 border-t-[#004481] rounded-full animate-spin inline-block" /></div>
      ) : filteredTxs.length === 0 ? (
        <p className="text-center text-[13px] text-gray-400 py-8">Sin movimientos en esta categoría.</p>
      ) : (
        <div className="max-h-[350px] overflow-y-auto divide-y divide-[#F0F2F5] -mx-1 px-1">
          {filteredTxs.map((tx, i) => {
            const classification = getTxClassification(tx);
            // Dynamic theme selection based on category/classification
            let cat = categoryStyle[tx.category] || categoryStyle.shop;
            if (classification === 'prestamos') cat = { bg: '#FEF3C7', color: '#92400E' };
            else if (classification === 'recargas') cat = { bg: '#E6F7F0', color: '#0F6E56' };
            else if (classification === 'transferencias') cat = { bg: '#EEF3FB', color: '#004481' };

            const isPos = parseFloat(tx.amount) > 0;
            return (
              <div key={i} className="py-2.5">
                {/* Header item (Clickable) */}
                <div 
                  onClick={() => setExpandedTxIndex(expandedTxIndex === i ? null : i)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50/50 p-1.5 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ background: cat.bg, color: cat.color }}>
                    {renderCategoryIcon(classification, tx.category, "w-4 h-4")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1A2B4A] truncate">{tx.name}</p>
                    <p className="text-[10px] text-gray-400">{tx.date}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold font-mono shrink-0" style={{ color: isPos ? '#0F6E56' : '#DC2626' }}>
                      {isPos ? '+' : ''}S/ {Math.abs(tx.amount).toFixed(2)}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${expandedTxIndex === i ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Accordion Detail Panel */}
                <AnimatePresence>
                  {expandedTxIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 bg-[#F8FAFC] border border-[#EAECF0] rounded-xl p-3 text-[10.5px] text-[#1A2B4A] space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div>
                          <span className="text-gray-400 block text-[9.5px] uppercase font-semibold">Canal de operación:</span>
                          <span className="font-semibold capitalize text-[11px]">{tx.canal || 'Banca por Internet'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9.5px] uppercase font-semibold">Estado:</span>
                          <span className="text-[#0F6E56] font-bold flex items-center gap-0.5 text-[11px]">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Procesado
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9.5px] uppercase font-semibold">Código único (CCI):</span>
                          <span className="font-mono font-semibold text-[11px]">TX-{100000 + i}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9.5px] uppercase font-semibold">Tipo de operación:</span>
                          <span className="font-semibold text-[11px]">{isPos ? 'Ingreso (Abono)' : 'Egreso (Cargo)'}</span>
                        </div>
                      </div>
                      <div className="border-t border-[#EAECF0] pt-2 flex items-center justify-between gap-3">
                        <div className="max-w-[70%]">
                          <span className="text-gray-400 block text-[9.5px] uppercase font-semibold">Descripción del movimiento:</span>
                          <p className="text-[11px] font-medium text-gray-700 leading-normal">{tx.name}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadReceipt({
                              id: `TX-${100000 + i}`,
                              date: tx.date,
                              type: tx.amount < 0 ? 'Pago/Egreso' : 'Ingreso/Abono',
                              canal: tx.canal === 'app_movil' ? 'Banca Móvil App' : 'Banca por Internet',
                              description: tx.name,
                              amount: tx.amount
                            });
                          }}
                          className="bg-[#004481] hover:bg-[#1565C0] text-white text-[9.5px] font-extrabold px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Recibo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
  const [expandedMovIndex, setExpandedMovIndex] = useState(null);

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

  const cardSuffix = cuenta.replace('019-', '');
  const realCardNumber = `4821 75${cardSuffix.substring(0, 2)} ${cardSuffix.substring(2, 6)} ${cardSuffix.substring(6)}014`;

  const quickActions = [
    { icon: '↗', label: 'Transferir', color: '#EEF3FB', text: '#004481', key: 'transferir' },
    { icon: '⚡', label: 'Servicios', color: '#FFF3F3', text: '#E53E3E', key: 'servicios' },
    { icon: '💳', label: 'Préstamo', color: '#FEF3C7', text: '#92400E', key: 'prestamo' },
    { icon: '📲', label: 'Recargar', color: '#E6F7F0', text: '#0F6E56', key: 'recargar' },
    { icon: '📄', label: 'Movimientos', color: '#F5F0FF', text: '#5B21B6', key: 'extracto' },
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans">
      {/* ── ALERTA ENTORNO ACADÉMICO / SIMULACIÓN ── */}
      <div className="bg-amber-500 text-white text-center py-2.5 px-4 text-[12px] font-bold shadow-sm relative z-50 flex items-center justify-center gap-2">
        <svg className="w-4.5 h-4.5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.52 13.064c-.377.162-.77.304-1.177.424A9.12 9.12 0 001 18.062c0 .937.121 1.848.349 2.718A12.011 12.011 0 0012 23c2.907 0 5.598-.87 7.854-2.36a11.97 11.97 0 00.347-2.718A9.12 9.12 0 0018.5 13.5c-.407-.12-.8-.262-1.177-.424" />
        </svg>
        <span>ATENCIÓN: Este sitio es una SIMULACIÓN ACADÉMICA de banca por internet para un proyecto de la Universidad. No es un banco real.</span>
      </div>

      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#E6F7F0] border border-[#0F6E56]/20 text-[#0F6E56] px-5 py-3.5 rounded-xl shadow-2xl text-[13px] font-semibold flex items-center gap-2.5 transition-all">
          <svg className="w-5 h-5 text-[#0F6E56] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
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
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
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

        {/* SECCIÓN DE PRODUCTOS (ESTILO BBVA: CUENTAS/TARJETAS Y SALUD FINANCIERA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* COLUMNA IZQUIERDA: CUENTAS Y TARJETAS */}
          <div className="space-y-5">
            {/* CUENTAS */}
            <div>
              <div className="flex justify-between items-center mb-2.5">
                <h2 className="text-[11.5px] font-extrabold text-[#004481] uppercase tracking-[1.2px]">Cuentas</h2>
                <button onClick={() => setShowSaldo(!showSaldo)}
                  className="text-[#004481] hover:text-[#1565C0] text-[10.5px] font-bold flex items-center gap-1 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    {showSaldo ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                  <span>{showSaldo ? 'Ocultar saldos' : 'Ver saldos'}</span>
                </button>
              </div>
              
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#EAECF0] p-4.5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEF3FB] text-[#004481] flex items-center justify-center shrink-0">
                    <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#072146]">Cuenta Independencia</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">{cuenta}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9.5px] text-gray-400 uppercase font-semibold">Saldo disponible</p>
                  <AnimatePresence mode="wait">
                    {showSaldo ? (
                      <motion.p key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-[17px] font-black text-[#072146] font-mono leading-tight mt-0.5">
                        <span className="text-[12px] font-bold mr-0.5">S/</span>
                        {isLoadingData ? '—' : saldoNum.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </motion.p>
                    ) : (
                      <motion.p key="hide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-[15px] font-black text-[#072146] tracking-[0.1em] leading-tight mt-0.5">••••••</motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* TARJETAS */}
            <div>
              <h2 className="text-[11.5px] font-extrabold text-[#004481] uppercase tracking-[1.2px] mb-2.5">Tarjetas</h2>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-[#EAECF0] p-4.5 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-7 rounded bg-gradient-to-br from-[#004481] to-[#072146] border border-white/10 p-1 flex flex-col justify-between shrink-0 shadow-sm relative overflow-hidden">
                    <span className="text-white/[0.15] text-[6.5px] font-black italic">EkuBank</span>
                    <p className="text-white/40 text-[6px] font-mono tracking-widest text-right">•••• {cardSuffix.substring(6)}014</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#072146]">Tarjeta de Débito Visa</p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">{realCardNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9.5px] text-gray-400 uppercase font-semibold">Línea de compras</p>
                  <AnimatePresence mode="wait">
                    {showSaldo ? (
                      <motion.p key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-[14.5px] font-bold text-gray-600 font-mono leading-tight mt-0.5">
                        <span className="text-[11.5px] font-medium mr-0.5">S/</span>
                        {isLoadingData ? '—' : saldoNum.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </motion.p>
                    ) : (
                      <motion.p key="hide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-[13px] font-bold text-gray-400 tracking-[0.1em] mt-0.5">••••••</motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>

          {/* COLUMNA DERECHA: SALUD FINANCIERA */}
          <div>
            <h2 className="text-[11.5px] font-extrabold text-[#004481] uppercase tracking-[1.2px] mb-2.5">Salud Financiera</h2>
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.08 }}
              className="bg-white border border-[#EAECF0] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-[184px] w-full shadow-sm hover:shadow-md transition-all">
              <div className="relative z-10 flex flex-col justify-between h-full w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11.5px] text-gray-500 font-bold">Score Crediticio EkuBank</p>
                  </div>
                  <div>
                    {score >= 750 && <span className="bg-[#E6F7F0] text-[#0F6E56] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Excelente</span>}
                    {score >= 600 && score < 750 && <span className="bg-[#EEF3FB] text-[#004481] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Normal</span>}
                    {score >= 450 && score < 600 && <span className="bg-[#FEF3C7] text-[#92400E] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Riesgo (CPP)</span>}
                    {score < 450 && <span className="bg-red-50 text-[#DC2626] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Crítico</span>}
                  </div>
                </div>

                <div className="my-0.5">
                  <div className="flex items-baseline leading-none">
                    <span className="text-[28px] font-black text-[#072146] font-mono leading-none">{score}</span>
                    <span className="text-[12px] text-gray-400 ml-1 font-semibold">/ 850 pts</span>
                  </div>
                </div>

                <div>
                  <div className="h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden w-full relative">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${((score - 300) / 550 * 100).toFixed(0)}%`,
                        backgroundColor: score >= 750 ? '#0D9E75' : score >= 600 ? '#1973B8' : score >= 450 ? '#D97706' : '#DC2626'
                      }} 
                    />
                  </div>
                </div>

                <p className="text-[9.5px] text-gray-400 leading-snug">
                  {score >= 750 && "¡Excelente! Mantienes tus cuotas al día. Tienes acceso preferencial a mejores tasas."}
                  {score >= 600 && score < 750 && "Buen comportamiento crediticio. Tu calificación en el sistema es Normal."}
                  {score >= 450 && score < 600 && "¡Alerta! Registras atrasos de pago. Cancela tus cuotas para evitar reportes SBS."}
                  {score < 450 && "Tu score se encuentra afectado por morosidad crítica. Regulariza tus pagos pronto."}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ACCIONES RÁPIDAS */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-5 gap-2 mb-5">
          {quickActions.map((a) => (
            <button key={a.key} onClick={() => togglePanel(a.key)}
              className={`flex flex-col items-center gap-2 rounded-[14px] py-4 px-2 border transition-all ${
                activePanel === a.key
                  ? 'bg-[#004481] border-[#004481] shadow-lg shadow-[#004481]/20'
                  : 'bg-white border-[#EAECF0] hover:shadow-md hover:-translate-y-0.5'
              }`}>
              <div className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-all"
                style={activePanel === a.key ? {} : { background: a.color, color: a.text }}>
                {renderActionIcon(a.key, activePanel === a.key ? "w-5 h-5 text-white" : "w-5 h-5")}
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
          {activePanel === 'servicios' && (
            <PanelServicios key="servicios" userDni={user?.dni} userToken={user?.token} saldoDisponible={saldoNum} onDone={handleOperationDone} onClose={() => setActivePanel(null)} />
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
                        <svg className="w-4.5 h-4.5 text-[#92400E] shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
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
        {activePanel !== 'extracto' && (
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
                  const classification = getTxClassification(tx);
                  const isPos = parseFloat(tx.amount) > 0;
                  return (
                    <div key={i} className="border-b border-[#F5F7FA] last:border-0 px-5 py-3">
                      {/* Header item (Clickable) */}
                      <div 
                        onClick={() => setExpandedMovIndex(expandedMovIndex === i ? null : i)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-[#FAFBFC] -mx-3 px-3 py-1 rounded-xl transition-colors"
                      >
                        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                          style={{ background: cat.bg, color: cat.color }}>
                          {renderCategoryIcon(classification, tx.category, "w-4.5 h-4.5")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#1A2B4A] truncate">{tx.name}</p>
                          <p className="text-[11.5px] text-gray-400 capitalize">{tx.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold font-mono shrink-0" style={{ color: isPos ? '#0F6E56' : '#DC2626' }}>
                            {isPos ? '+' : ''}S/ {Math.abs(tx.amount).toFixed(2)}
                          </span>
                          <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedMovIndex === i ? 'rotate-180' : ''}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Accordion Detail Panel */}
                      <AnimatePresence>
                        {expandedMovIndex === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-2 bg-[#F8FAFC] border border-[#EAECF0] rounded-xl p-3 text-[11px] text-[#1A2B4A] space-y-2.5"
                          >
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Canal:</span>
                                <span className="font-semibold capitalize">{tx.canal || 'Banca por Internet'}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Estado:</span>
                                <span className="text-[#0F6E56] font-bold flex items-center gap-0.5">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Procesado
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Código único:</span>
                                <span className="font-mono font-semibold">TX-{200000 + i}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Tipo:</span>
                                <span className="font-semibold">{isPos ? 'Ingreso (Abono)' : 'Egreso (Cargo)'}</span>
                              </div>
                            </div>
                            <div className="border-t border-gray-200/60 pt-2.5 flex items-center justify-between gap-3">
                              <div className="max-w-[70%]">
                                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Descripción completa:</span>
                                <p className="text-[11px] font-medium text-gray-700 leading-relaxed">{tx.name}</p>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadReceipt({
                                    id: `TX-${200000 + i}`,
                                    date: tx.date,
                                    type: tx.amount < 0 ? 'Pago/Egreso' : 'Ingreso/Abono',
                                    canal: tx.canal === 'app_movil' ? 'Banca Móvil App' : 'Banca por Internet',
                                    description: tx.name,
                                    amount: tx.amount
                                  });
                                }}
                                className="bg-[#004481] hover:bg-[#1565C0] text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-sm"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Recibo
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
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
