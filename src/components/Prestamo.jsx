import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

const PLAZOS = [6, 12, 18, 24, 36];
const DIAS_PAGO = [3, 5, 10, 15];
const TEA_CON_SEGURO = 0.4092;
const TEA_SIN_SEGURO = 0.4392;

const calcCuota = (monto, plazos, tea) => {
  const tm = Math.pow(1 + tea, 1 / 12) - 1;
  return monto * tm / (1 - Math.pow(1 + tm, -plazos));
};

const generarCronograma = (monto, plazos, tea, fechaDesembolso, diaPago) => {
  const tm = Math.pow(1 + tea, 1 / 12) - 1;
  const cuota = monto * tm / (1 - Math.pow(1 + tm, -plazos));
  let saldo = monto;
  const rows = [];
  const inicio = new Date(fechaDesembolso);

  for (let i = 1; i <= plazos; i++) {
    const fechaPago = new Date(inicio.getFullYear(), inicio.getMonth() + i, diaPago);
    const interes = saldo * tm;
    const capital = cuota - interes;
    saldo = Math.max(saldo - capital, 0);
    rows.push({
      n: i,
      fecha: fechaPago.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      cuota: cuota.toFixed(2),
      capital: capital.toFixed(2),
      interes: interes.toFixed(2),
      saldo: saldo.toFixed(2),
    });
  }
  return rows;
};

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const Prestamo = ({ userDni, userToken, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [monto, setMonto] = useState('');
  const [plazos, setPlazos] = useState(12);
  const [proposito, setProposito] = useState('');
  const [conSeguro, setConSeguro] = useState(true);
  const [fechaDesembolso, setFechaDesembolso] = useState(getTodayStr());
  const [diaPago, setDiaPago] = useState(5);
  const [msg, setMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prestamoId, setPrestamoId] = useState(null);
  const [showCronograma, setShowCronograma] = useState(false);

  const [ingresosClient, setIngresosClient] = useState('');
  const [gastosClient, setGastosClient] = useState('');

  const tea = conSeguro ? TEA_CON_SEGURO : TEA_SIN_SEGURO;
  const teaLabel = conSeguro ? '40.92%' : '43.92%';
  const montoNum = parseFloat(monto) || 0;
  const cuota = montoNum > 0 ? calcCuota(montoNum, plazos, tea) : 0;

  const cronograma = useMemo(() => {
    if (montoNum < 500) return [];
    return generarCronograma(montoNum, plazos, tea, fechaDesembolso, diaPago);
  }, [montoNum, plazos, tea, fechaDesembolso, diaPago]);

  const solicitar = async (e) => {
    e.preventDefault();
    if (montoNum < 500) { setMsg('El monto mínimo es S/ 500.'); return; }
    if (montoNum > 50000) { setMsg('El monto máximo es S/ 50,000.'); return; }
    setIsLoading(true);
    setMsg('');
    try {
      const res = await fetch('https://ekubank.ekubyte.net.pe/api/controllers/PrestamoController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: userToken,
          dni: userDni,
          monto: montoNum,
          plazos,
          proposito,
          tea,
          dia_pago: diaPago,
          fecha_desembolso: fechaDesembolso,
          ingresos_declarados: Number(ingresosClient) || 0,
          gastos_declarados: Number(gastosClient) || 0
        }),
      });
      const data = await res.json();
      setMsg(data.message);
      setIsSuccess(data.success);
      if (data.success) {
        setPrestamoId(data.prestamo_id);
        setStep(3);
        if (onSuccess) onSuccess();
      }
    } catch {
      setMsg('Error de conexión. Intenta nuevamente.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#EAECF0] overflow-hidden mt-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAECF0] bg-gradient-to-r from-[#004481] to-[#1565C0]">
        <div>
          <p className="text-white/60 text-[10px] uppercase tracking-[1.2px] font-semibold">Crédito Empresarial — Micro Micro</p>
          <p className="text-white font-semibold text-[15px]">Solicitud de crédito</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#49D0A0]/20 text-[#49D0A0] text-[11px] font-bold px-2.5 py-1 rounded-full">TEA {teaLabel}</span>
          {onClose && (
            <button onClick={onClose} className="text-white/60 hover:text-white text-[18px] leading-none transition-colors">&times;</button>
          )}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* STEP 1 — Monto, plazo, seguro, fecha desembolso, día pago */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div>
                <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-2">¿Cuánto necesitas? (S/)</label>
                <input
                  type="number"
                  placeholder="Ej. 5000"
                  value={monto}
                  min={500}
                  max={50000}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full border-[1.5px] border-[#E0E6ED] rounded-[10px] bg-[#F8FAFC] focus:border-[#1973B8] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] focus:bg-white outline-none text-[16px] font-bold text-[#1A2B4A] px-4 h-[50px] placeholder:font-normal placeholder:text-[14px] placeholder:text-[#B0BEC5] transition-all"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">Mínimo S/ 500 — Máximo S/ 50,000</p>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-2">Plazo de pago</label>
                <div className="grid grid-cols-5 gap-2">
                  {PLAZOS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlazos(p)}
                      className={`py-2.5 rounded-[10px] text-[13px] font-semibold border-[1.5px] transition-all ${
                        plazos === p
                          ? 'bg-[#004481] border-[#004481] text-white shadow-md'
                          : 'bg-[#F8FAFC] border-[#E0E6ED] text-[#1A2B4A] hover:border-[#1973B8]'
                      }`}
                    >
                      {p}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-2">Seguro de desgravamen</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setConSeguro(true)}
                    className={`py-2.5 rounded-[10px] text-[12px] font-semibold border-[1.5px] transition-all ${
                      conSeguro ? 'bg-[#004481] border-[#004481] text-white shadow-md' : 'bg-[#F8FAFC] border-[#E0E6ED] text-[#1A2B4A] hover:border-[#1973B8]'
                    }`}>Con seguro · 40.92%</button>
                  <button type="button" onClick={() => setConSeguro(false)}
                    className={`py-2.5 rounded-[10px] text-[12px] font-semibold border-[1.5px] transition-all ${
                      !conSeguro ? 'bg-[#004481] border-[#004481] text-white shadow-md' : 'bg-[#F8FAFC] border-[#E0E6ED] text-[#1A2B4A] hover:border-[#1973B8]'
                    }`}>Sin seguro · 43.92%</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-2">Fecha de desembolso</label>
                  <input
                    type="date"
                    value={fechaDesembolso}
                    onChange={(e) => setFechaDesembolso(e.target.value)}
                    min={getTodayStr()}
                    className="w-full border-[1.5px] border-[#E0E6ED] rounded-[10px] bg-[#F8FAFC] focus:border-[#1973B8] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] outline-none text-[13px] font-semibold text-[#1A2B4A] px-3 h-[46px] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-2">Día de pago mensual</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DIAS_PAGO.map((d) => (
                      <button key={d} type="button" onClick={() => setDiaPago(d)}
                        className={`py-2.5 rounded-[10px] text-[13px] font-semibold border-[1.5px] transition-all ${
                          diaPago === d
                            ? 'bg-[#004481] border-[#004481] text-white shadow-md'
                            : 'bg-[#F8FAFC] border-[#E0E6ED] text-[#1A2B4A] hover:border-[#1973B8]'
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {montoNum >= 500 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#EEF6FF] rounded-[12px] p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11px] text-[#004481]/60 uppercase tracking-[0.8px] font-semibold">Cuota mensual estimada</p>
                    <p className="text-[26px] font-bold text-[#004481] font-mono">
                      <span className="text-[14px] font-normal mr-1">S/</span>
                      {cuota.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#004481]/60">Total a pagar</p>
                    <p className="text-[14px] font-bold text-[#1973B8]">S/ {(cuota * plazos).toFixed(2)}</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => montoNum >= 500 ? setStep(2) : setMsg('Ingresa un monto válido (mínimo S/ 500).')}
                className="w-full h-12 rounded-[10px] bg-[#004481] hover:bg-[#1565C0] text-white text-[14px] font-semibold transition-colors"
              >
                Ver cronograma y confirmar →
              </button>
              {msg && <p className="text-red-600 text-[12px] text-center font-medium">{msg}</p>}
            </motion.div>
          )}

          {/* STEP 2 — Cronograma, propósito y confirmación */}
          {step === 2 && (
            <motion.form key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={solicitar} className="space-y-5">
              {/* Resumen */}
              <div className="bg-[#F8FAFC] rounded-[12px] p-4 border border-[#E0E6ED]">
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Monto</span>
                    <span className="font-bold text-[#072146]">S/ {montoNum.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plazo</span>
                    <span className="font-bold text-[#072146]">{plazos} meses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">TEA</span>
                    <span className="font-bold text-[#072146]">{teaLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Seguro</span>
                    <span className="font-bold text-[#072146]">{conSeguro ? 'Con seguro' : 'Sin seguro'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Desembolso</span>
                    <span className="font-bold text-[#072146]">{new Date(fechaDesembolso + 'T12:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Día de pago</span>
                    <span className="font-bold text-[#072146]">Cada {diaPago} del mes</span>
                  </div>
                </div>
                <div className="flex justify-between text-[13px] border-t border-[#E0E6ED] pt-2 mt-3">
                  <span className="text-gray-500">Cuota mensual fija</span>
                  <span className="font-bold text-[#004481] text-[16px]">S/ {cuota.toFixed(2)}</span>
                </div>
              </div>

              {/* Cronograma de pagos */}
              <div className="border border-[#E0E6ED] rounded-[12px] overflow-hidden">
                <button type="button" onClick={() => setShowCronograma(!showCronograma)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#F7F8FA] hover:bg-[#EEF3FB] transition-colors">
                  <span className="text-[12px] font-bold text-[#004481]">Cronograma de pagos ({plazos} cuotas)</span>
                  <span className="text-[14px] text-[#004481] transition-transform" style={{ transform: showCronograma ? 'rotate(180deg)' : 'none' }}>▼</span>
                </button>
                <AnimatePresence>
                  {showCronograma && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left">
                          <thead className="sticky top-0">
                            <tr className="bg-[#004481] text-white">
                              <th className="text-[10px] font-semibold px-3 py-2 text-center">N°</th>
                              <th className="text-[10px] font-semibold px-3 py-2">Fecha pago</th>
                              <th className="text-[10px] font-semibold px-3 py-2 text-right">Cuota</th>
                              <th className="text-[10px] font-semibold px-3 py-2 text-right">Capital</th>
                              <th className="text-[10px] font-semibold px-3 py-2 text-right">Interés</th>
                              <th className="text-[10px] font-semibold px-3 py-2 text-right">Saldo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#F0F2F5]">
                            {cronograma.map((row) => (
                              <tr key={row.n} className="hover:bg-[#FAFBFC] text-[11px]">
                                <td className="px-3 py-2 text-center font-bold text-[#004481]">{row.n}</td>
                                <td className="px-3 py-2 text-gray-600 font-mono">{row.fecha}</td>
                                <td className="px-3 py-2 text-right font-semibold text-[#072146]">{row.cuota}</td>
                                <td className="px-3 py-2 text-right text-[#0F6E56]">{row.capital}</td>
                                <td className="px-3 py-2 text-right text-[#DC2626]">{row.interes}</td>
                                <td className="px-3 py-2 text-right font-mono text-gray-500">{row.saldo}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-[#F7F8FA] font-bold text-[11px]">
                              <td className="px-3 py-2.5" colSpan={2}>TOTAL</td>
                              <td className="px-3 py-2.5 text-right text-[#072146]">{(cuota * plazos).toFixed(2)}</td>
                              <td className="px-3 py-2.5 text-right text-[#0F6E56]">{montoNum.toFixed(2)}</td>
                              <td className="px-3 py-2.5 text-right text-[#DC2626]">{(cuota * plazos - montoNum).toFixed(2)}</td>
                              <td className="px-3 py-2.5 text-right text-gray-400">0.00</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ingresos y Gastos del Cliente */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-1.5">Tus ingresos mensuales (S/)</label>
                  <input
                    type="number"
                    placeholder="Ej. 3500"
                    value={ingresosClient}
                    onChange={(e) => setIngresosClient(e.target.value)}
                    required
                    className="w-full border-[1.5px] border-[#E0E6ED] rounded-[10px] bg-[#F8FAFC] focus:border-[#1973B8] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] focus:bg-white outline-none text-[13px] font-semibold text-[#1A2B4A] px-3 h-[46px] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-1.5">Tus gastos mensuales (S/)</label>
                  <input
                    type="number"
                    placeholder="Ej. 1200"
                    value={gastosClient}
                    onChange={(e) => setGastosClient(e.target.value)}
                    required
                    className="w-full border-[1.5px] border-[#E0E6ED] rounded-[10px] bg-[#F8FAFC] focus:border-[#1973B8] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] focus:bg-white outline-none text-[13px] font-semibold text-[#1A2B4A] px-3 h-[46px] transition-all"
                  />
                </div>
              </div>

              {/* Propósito */}
              <div>
                <label className="block text-[10.5px] font-semibold text-[#004481] tracking-[1px] uppercase mb-2">Propósito del préstamo</label>
                <select
                  value={proposito}
                  onChange={(e) => setProposito(e.target.value)}
                  required
                  className="w-full border-[1.5px] border-[#E0E6ED] rounded-[10px] bg-[#F8FAFC] focus:border-[#1973B8] focus:shadow-[0_0_0_3px_rgba(25,115,184,0.12)] outline-none text-[14px] text-[#1A2B4A] px-4 h-[46px] transition-all appearance-none"
                >
                  <option value="">Selecciona un propósito...</option>
                  <option value="Capital de trabajo">Capital de trabajo</option>
                  <option value="Negocio / Emprendimiento">Negocio / Emprendimiento</option>
                  <option value="Remodelación vivienda">Remodelación vivienda</option>
                  <option value="Consolidación de deudas">Consolidación de deudas</option>
                  <option value="Educación">Educación</option>
                  <option value="Salud">Salud</option>
                  <option value="Gastos personales">Gastos personales</option>
                  <option value="Gastos médicos">Gastos médicos</option>
                  <option value="Viaje">Viaje</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <AnimatePresence>
                {msg && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-red-600 text-[12px] text-center font-medium">
                    {msg}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 h-12 rounded-[10px] border-[1.5px] border-[#E0E6ED] text-[#004481] text-[13px] font-semibold hover:bg-[#F0F5FB] transition-colors">
                  ← Volver
                </button>
                <button type="submit" disabled={isLoading} className="flex-2 flex-[2] h-12 rounded-[10px] bg-[#49D0A0] hover:bg-[#3ab98d] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-65">
                  {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</> : 'Solicitar evaluación'}
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3 — Éxito con cronograma final */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-4">
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-full bg-[#E6F7F0] flex items-center justify-center mx-auto mb-4 text-[30px]">✓</div>
                <h3 className="text-[18px] font-bold text-[#072146] mb-2">¡Solicitud enviada!</h3>
                {prestamoId && (
                  <div className="bg-[#EEF3FB] rounded-[10px] inline-block px-4 py-2 mb-3">
                    <p className="text-[10px] text-[#004481]/60 uppercase tracking-[1px] font-semibold">Código de préstamo</p>
                    <p className="text-[20px] font-bold text-[#004481] font-mono">PRE-{String(prestamoId).padStart(6, '0')}</p>
                  </div>
                )}
                <p className="text-[13px] text-gray-500 mb-1">Préstamo por <span className="font-bold text-[#004481]">S/ {montoNum.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span></p>
                <p className="text-[12px] text-gray-400">{plazos} cuotas de S/ {cuota.toFixed(2)} · TEA {teaLabel} · Pago cada {diaPago} del mes</p>
              </div>

              {/* Cronograma final */}
              <div className="border border-[#E0E6ED] rounded-[12px] overflow-hidden mb-5">
                <div className="px-4 py-2.5 bg-[#004481] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white">Cronograma de pagos</span>
                  <span className="text-[10px] text-white/60">{plazos} cuotas fijas</span>
                </div>
                <div className="max-h-[250px] overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="sticky top-0">
                      <tr className="bg-[#F7F8FA]">
                        <th className="text-[10px] text-gray-400 font-semibold px-3 py-2 text-center">N°</th>
                        <th className="text-[10px] text-gray-400 font-semibold px-3 py-2">Fecha</th>
                        <th className="text-[10px] text-gray-400 font-semibold px-3 py-2 text-right">Cuota</th>
                        <th className="text-[10px] text-gray-400 font-semibold px-3 py-2 text-right">Capital</th>
                        <th className="text-[10px] text-gray-400 font-semibold px-3 py-2 text-right">Interés</th>
                        <th className="text-[10px] text-gray-400 font-semibold px-3 py-2 text-right">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F2F5]">
                      {cronograma.map((row) => (
                        <tr key={row.n} className="text-[11px]">
                          <td className="px-3 py-1.5 text-center font-bold text-[#004481]">{row.n}</td>
                          <td className="px-3 py-1.5 text-gray-600 font-mono">{row.fecha}</td>
                          <td className="px-3 py-1.5 text-right font-semibold">{row.cuota}</td>
                          <td className="px-3 py-1.5 text-right text-[#0F6E56]">{row.capital}</td>
                          <td className="px-3 py-1.5 text-right text-[#DC2626]">{row.interes}</td>
                          <td className="px-3 py-1.5 text-right font-mono text-gray-500">{row.saldo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-[12px] text-gray-400 text-center mb-4">Guarda tu código para seguimiento. Un asesor evaluará tu solicitud dentro de 24-48 horas hábiles.</p>
              {onClose && (
                <div className="text-center">
                  <button onClick={onClose} className="px-6 h-11 rounded-[10px] bg-[#004481] text-white text-[13px] font-semibold hover:bg-[#1565C0] transition-colors">
                    Cerrar
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Prestamo;
