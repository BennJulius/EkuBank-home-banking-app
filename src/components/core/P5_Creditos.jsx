import { useState, useEffect } from 'react';

const KPI = ({ label, value, sub, accent, danger }) => (
  <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5 hover:shadow-md transition-shadow">
    <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
    <p className={`text-[28px] font-bold leading-none tracking-tight ${danger ? 'text-[#DC2626]' : accent ? 'text-[#0F6E56]' : 'text-[#072146]'}`}>{value}</p>
    {sub && <p className={`text-[11px] mt-1.5 ${danger ? 'text-[#DC2626]/70' : accent ? 'text-[#0F6E56]/70' : 'text-gray-400'}`}>{sub}</p>}
  </div>
);

const Badge = ({ children, variant }) => {
  const s = {
    VIABLE: 'bg-[#E6F7F0] text-[#0F6E56] border-[#0F6E56]/20',
    REVISAR: 'bg-[#FEF3C7] text-[#92400E] border-[#92400E]/20',
    RECHAZAR: 'bg-red-50 text-[#DC2626] border-red-200',
    pendiente: 'bg-[#FEF3C7] text-[#92400E] border-[#92400E]/20',
    propuesto: 'bg-[#EEF3FB] text-[#004481] border-[#004481]/20',
    aprobado: 'bg-[#E6F7F0] text-[#0F6E56] border-[#0F6E56]/20',
    rechazado: 'bg-red-50 text-[#DC2626] border-red-200',
    PREMIER: 'bg-[#EEF3FB] text-[#004481] border-[#004481]/10',
    ESTANDAR: 'bg-[#E6F7F0] text-[#0F6E56] border-[#0F6E56]/10',
    BASICO: 'bg-[#FEF3C7] text-[#92400E] border-[#92400E]/10',
  };
  return (
    <span className={`${s[variant] || 'bg-gray-100 text-gray-600 border-gray-200'} px-2 py-0.5 rounded-md text-[10px] font-bold border`}>
      {children}
    </span>
  );
};

const P5Creditos = ({ apiData, empleado, onRefreshData }) => {
  const r = apiData?.creditos_resumen || {};
  const lista = apiData?.creditos_lista || [];
  const propositos = apiData?.creditos_proposito || [];
  const isAdmin = empleado?.rol === 'administrador' || empleado?.rol === 'admin';
  const [filtro, setFiltro] = useState('todos');
  const [expanded, setExpanded] = useState(null);
  const [modal, setModal] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const [ingresosEval, setIngresosEval] = useState('');
  const [gastosEval, setGastosEval] = useState('');
  const [propuestaEval, setPropuestaEval] = useState('aprobado');

  useEffect(() => {
    if (modal) {
      setIngresosEval(modal.ingresos_evaluador !== null && modal.ingresos_evaluador !== undefined ? modal.ingresos_evaluador : modal.ingreso || '');
      setGastosEval(modal.gastos_evaluador !== null && modal.gastos_evaluador !== undefined ? modal.gastos_evaluador : '0');
      setPropuestaEval(modal.propuesta_evaluador || (modal.evaluacion_auto === 'RECHAZAR' ? 'rechazado' : 'aprobado'));
      setObservacion(modal.observacion || '');
    } else {
      setIngresosEval('');
      setGastosEval('');
      setPropuestaEval('aprobado');
      setObservacion('');
    }
  }, [modal]);

  const filteredList = filtro === 'todos'
    ? lista
    : lista.filter(c => c.evaluacion_auto === filtro || c.estado === filtro);

  const totalPendientes = Number(r.pendientes || 0);
  const totalAprobados = Number(r.aprobados || 0);
  const totalRechazados = Number(r.rechazados || 0);

  const handleEnviarPropuesta = async () => {
    if (!modal) return;
    setProcessing(true);
    try {
      const res = await fetch('https://ekubank.ekubyte.net.pe/api/controllers/CoreController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${empleado?.token}` },
        body: JSON.stringify({
          solicitud_id: modal.solicitud_id || modal.id,
          accion: 'propuesta',
          ingresos_evaluador: Number(ingresosEval) || 0,
          gastos_evaluador: Number(gastosEval) || 0,
          propuesta_evaluador: propuestaEval,
          observacion: observacion,
          evaluado_por: empleado?.dni || 'SYSTEM',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ type: 'propuesta', message: json.message });
        setTimeout(() => setToast(null), 4000);
        setModal(null);
        if (onRefreshData) onRefreshData();
      } else {
        setToast({ type: 'error', message: json.message });
        setTimeout(() => setToast(null), 4000);
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión con el servidor.' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleResolverAdministrador = async (decision) => {
    if (!modal) return;
    setProcessing(true);
    try {
      const res = await fetch('https://ekubank.ekubyte.net.pe/api/controllers/CoreController.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${empleado?.token}` },
        body: JSON.stringify({
          solicitud_id: modal.solicitud_id || modal.id,
          accion: decision,
          observacion: observacion,
          evaluado_por: empleado?.dni || 'SYSTEM',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setToast({ type: decision, message: json.message });
        setTimeout(() => setToast(null), 4000);
        setModal(null);
        if (onRefreshData) onRefreshData();
      } else {
        setToast({ type: 'error', message: json.message });
        setTimeout(() => setToast(null), 4000);
      }
    } catch {
      setToast({ type: 'error', message: 'Error de conexión con el servidor.' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-5 relative">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border text-[13px] font-semibold flex items-center gap-2.5 animate-[slideIn_0.3s_ease] ${
          toast.type === 'aprobado' ? 'bg-[#E6F7F0] text-[#0F6E56] border-[#0F6E56]/20' :
          toast.type === 'rechazado' ? 'bg-red-50 text-[#DC2626] border-red-200' :
          'bg-[#FEF3C7] text-[#92400E] border-[#92400E]/20'
        }`}>
          <span className="text-[18px]">{toast.type === 'aprobado' ? '✅' : toast.type === 'rechazado' ? '❌' : '⚠️'}</span>
          {toast.message}
        </div>
      )}

      {/* Modal de evaluación */}
      {modal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setModal(null); setObservacion(''); }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#EAECF0] w-full max-w-[540px] mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-[#EAECF0] bg-[#F7F8FA]">
              <p className="text-[16px] font-bold text-[#072146]">
                {isAdmin ? 'Comité de Aprobación — Resolución' : 'Análisis y Registro de Evaluación'}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">ID #{modal.solicitud_id || modal.id} · {modal.nombre_completo}</p>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Client financial indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F7F8FA] rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 font-medium">Monto solicitado</p>
                  <p className="text-[18px] font-bold text-[#072146]">S/ {Number(modal.monto).toLocaleString()}</p>
                </div>
                <div className="bg-[#F7F8FA] rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 font-medium">Cuota mensual</p>
                  <p className="text-[18px] font-bold text-[#004481]">S/ {Number(modal.cuota).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-[#F7F8FA]">
                  <p className="text-[10px] text-gray-400">Plazo</p>
                  <p className="text-[13px] font-bold text-[#072146]">{modal.plazo} meses</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#F7F8FA]">
                  <p className="text-[10px] text-gray-400">Score</p>
                  <p className={`text-[13px] font-bold ${Number(modal.score) >= 600 ? 'text-[#0F6E56]' : Number(modal.score) >= 400 ? 'text-[#92400E]' : 'text-[#DC2626]'}`}>{modal.score}</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#F7F8FA]">
                  <p className="text-[10px] text-gray-400">Ratio C/I</p>
                  <p className={`text-[13px] font-bold ${parseFloat(modal.ratio_cuota_ingreso) > 40 ? 'text-[#DC2626]' : parseFloat(modal.ratio_cuota_ingreso) > 30 ? 'text-[#92400E]' : 'text-[#0F6E56]'}`}>{modal.ratio_cuota_ingreso}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap pb-1 border-b border-[#F0F2F5]">
                <Badge variant={modal.segmento}>{modal.segmento}</Badge>
                <Badge variant={modal.evaluacion_auto}>{modal.evaluacion_auto}</Badge>
                <span className="text-[10px] text-gray-400">SBS: {modal.entidades_sbs} entid. · {modal.calificacion_sbs}</span>
                {Number(modal.max_dias_atraso) > 0 && (
                  <span className="text-[9px] bg-red-50 text-red-600 border border-red-200/50 px-1.5 py-0.5 rounded font-bold">
                    Mora: S/ {Number(modal.mora_exacta).toFixed(2)} ({modal.max_dias_atraso}d)
                  </span>
                )}
              </div>

              {/* FLOW SECTION: EVALUATOR FORM (if asesor) vs COMPONENT PROPOSAL PREVIEW (if admin) */}
              {!isAdmin ? (
                // Evaluator (Asesor) input form
                <div className="space-y-4 pt-1">
                  {/* Declared values callout */}
                  <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-3.5 space-y-1.5 text-[11px]">
                    <p className="font-bold text-gray-400 uppercase tracking-[0.5px] border-b border-gray-200/40 pb-1 flex justify-between">
                      <span>Datos declarados por el cliente</span>
                      <span className="text-gray-400 font-mono text-[10px]">Autodeclaración</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <p>Ingresos Declarados: <span className="font-bold text-gray-700">S/ {Number(modal.ingresos_declarados || modal.ingreso || 0).toLocaleString()}</span></p>
                      <p>Gastos Declarados: <span className="font-bold text-gray-700">S/ {Number(modal.gastos_declarados || 0).toLocaleString()}</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-500 font-semibold block mb-1">Ingresos Evaluados / Verificados (S/)</label>
                      <input
                        type="number"
                        value={ingresosEval}
                        onChange={e => setIngresosEval(e.target.value)}
                        placeholder="Monto verificado"
                        className="w-full border border-[#E0E6ED] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 font-semibold block mb-1">Gastos Evaluados / Verificados (S/)</label>
                      <input
                        type="number"
                        value={gastosEval}
                        onChange={e => setGastosEval(e.target.value)}
                        placeholder="Monto verificado"
                        className="w-full border border-[#E0E6ED] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold block mb-1">Decisión Recomendada</label>
                    <select
                      value={propuestaEval}
                      onChange={e => setPropuestaEval(e.target.value)}
                      className="w-full border border-[#E0E6ED] rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-[#004481] bg-white transition-all"
                    >
                      <option value="aprobado">Aprobar (Recomendado)</option>
                      <option value="rechazado">Rechazar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold block mb-1">Sustento técnico / Observaciones</label>
                    <textarea
                      value={observacion}
                      onChange={e => setObservacion(e.target.value)}
                      placeholder="Escriba los motivos de su recomendación de ingresos, gastos y capacidad de pago..."
                      className="w-full border border-[#E0E6ED] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/10 resize-none transition-all"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                // Administrator view: Proposal details + Admin comments
                <div className="space-y-4 pt-1">
                  {modal.propuesta_evaluador ? (
                    <div className="bg-[#EEF3FB]/70 border border-[#004481]/15 rounded-xl p-4 space-y-2.5">
                      <p className="text-[11px] font-bold text-[#004481] uppercase tracking-[0.5px] border-b border-[#004481]/10 pb-1.5 flex justify-between items-center">
                        <span>Cuadro Comparativo de Evaluación</span>
                        <span className="text-[9px] font-semibold text-gray-400 uppercase">Evaluador: DNI {modal.evaluado_por || 'Asesor'}</span>
                      </p>
                      
                      <div className="grid grid-cols-3 gap-2 text-[10.5px] font-medium text-gray-400 uppercase tracking-[0.3px] text-center mb-1">
                        <div>Concepto</div>
                        <div>Declarado (Cliente)</div>
                        <div>Evaluado (Asesor)</div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11.5px] border-t border-gray-100 pt-1.5">
                        <span className="text-gray-500 font-medium">Ingresos Mensuales:</span>
                        <span className="font-semibold text-gray-600 text-center">S/ {Number(modal.ingresos_declarados || modal.ingreso || 0).toLocaleString()}</span>
                        <span className="font-bold text-[#004481] text-center">S/ {Number(modal.ingresos_evaluador || 0).toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11.5px] border-t border-gray-100 pt-1.5">
                        <span className="text-gray-500 font-medium">Gastos Mensuales:</span>
                        <span className="font-semibold text-gray-600 text-center">S/ {Number(modal.gastos_declarados || 0).toLocaleString()}</span>
                        <span className="font-bold text-[#004481] text-center">S/ {Number(modal.gastos_evaluador || 0).toLocaleString()}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11.5px] border-t border-gray-100 pt-1.5 pb-0.5">
                        <span className="text-gray-500 font-medium">Recomendación:</span>
                        <span className="text-gray-400 text-center">—</span>
                        <span className={`font-bold text-center uppercase ${modal.propuesta_evaluador === 'aprobado' ? 'text-[#0F6E56]' : 'text-[#DC2626]'}`}>
                          {modal.propuesta_evaluador}
                        </span>
                      </div>

                      {modal.observacion && (
                        <div className="text-[11px] bg-white/70 rounded-lg p-2.5 border border-[#004481]/5">
                          <span className="text-gray-400 font-medium block">Sustento del Evaluador:</span>
                          <p className="italic text-gray-600 mt-0.5">{modal.observacion}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[#FEF3C7]/30 border border-[#92400E]/20 rounded-xl p-3.5 text-[11.5px] text-[#92400E]">
                      ⚠️ <strong>Atención:</strong> Esta solicitud aún no tiene propuesta registrada por un evaluador. El flujo requiere que un evaluador analice la capacidad de pago antes de la resolución del comité.
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-gray-500 font-semibold block mb-1">Resolución / Observaciones del Administrador</label>
                    <textarea
                      value={observacion}
                      onChange={e => setObservacion(e.target.value)}
                      placeholder="Indique los motivos de la aprobación o rechazo final..."
                      className="w-full border border-[#E0E6ED] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#004481] focus:ring-2 focus:ring-[#004481]/10 resize-none transition-all"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#EAECF0] bg-[#F7F8FA] flex items-center gap-3">
              {!isAdmin ? (
                // Actions for Evaluator
                <>
                  <button
                    onClick={handleEnviarPropuesta}
                    disabled={processing}
                    className="flex-1 bg-[#004481] hover:bg-[#003366] text-white text-[13px] font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {processing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✓'} Enviar Propuesta
                  </button>
                  <button
                    onClick={() => { setModal(null); setObservacion(''); }}
                    className="px-5 py-3 bg-white border border-[#E0E6ED] text-gray-500 text-[13px] font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                // Actions for Admin
                <>
                  <button
                    onClick={() => handleResolverAdministrador('aprobado')}
                    disabled={processing}
                    className="flex-1 bg-[#0F6E56] hover:bg-[#0d5f4a] text-white text-[13px] font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✓'} Aprobar crédito
                  </button>
                  <button
                    onClick={() => handleResolverAdministrador('rechazado')}
                    disabled={processing}
                    className="flex-1 bg-[#DC2626] hover:bg-[#b91c1c] text-white text-[13px] font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {processing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '✗'} Rechazar
                  </button>
                  <button
                    onClick={() => { setModal(null); setObservacion(''); }}
                    className="px-5 py-3 bg-white border border-[#E0E6ED] text-gray-500 text-[13px] font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white border border-[#EAECF0] rounded-[14px] px-5 py-3 flex items-center gap-4 flex-wrap">
        <p className="text-[11px] font-semibold text-[#004481] uppercase tracking-[1px]">Solicitudes de crédito</p>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-gray-400 font-medium">Evaluación</label>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="text-[11px] border border-[#E0E6ED] rounded-lg px-2.5 py-1.5 outline-none bg-[#F8FAFC] focus:border-[#1973B8]"
          >
            <option value="todos">Todas</option>
            <option value="VIABLE">Viables</option>
            <option value="REVISAR">Requieren revisión</option>
            <option value="RECHAZAR">Recomendado rechazar</option>
            <option value="pendiente">Estado: Pendiente</option>
            <option value="aprobado">Estado: Aprobado</option>
            <option value="rechazado">Estado: Rechazado</option>
          </select>
        </div>
        <span className="text-[11px] text-gray-400 ml-auto">
          Mostrando {filteredList.length} de {lista.length} solicitudes
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPI
          label="Solicitudes pendientes"
          value={totalPendientes}
          sub={`de ${Number(r.total_solicitudes || 0)} totales`}
          danger={totalPendientes > 0}
        />
        <KPI
          label="Monto promedio solicitado"
          value={`S/ ${Number(r.monto_promedio || 0).toLocaleString()}`}
          sub={`Plazo promedio: ${r.plazo_promedio || 0} meses`}
        />
        <KPI
          label="Total solicitado"
          value={`S/ ${(Number(r.monto_total_solicitado || 0) / 1000).toFixed(1)}K`}
          sub="Suma de todas las solicitudes"
          accent
        />
        <KPI
          label="Cuota mensual promedio"
          value={`S/ ${Number(r.cuota_promedio || 0).toLocaleString()}`}
          sub="Calculada al 35% TEA"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Tabla de solicitudes */}
        <div className="col-span-2 bg-white border border-[#EAECF0] rounded-[16px] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAECF0] flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#072146]">Bandeja de evaluación crediticia</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Haga clic en una fila para ver detalles · Solicitudes pendientes se pueden evaluar</p>
            </div>
            <div className="flex gap-1.5">
              <span className="bg-[#E6F7F0] text-[#0F6E56] text-[10px] font-bold px-2 py-0.5 rounded-full">{totalAprobados} aprobados</span>
              <span className="bg-[#FEF3C7] text-[#92400E] text-[10px] font-bold px-2 py-0.5 rounded-full">{totalPendientes} pendientes</span>
              <span className="bg-red-50 text-[#DC2626] text-[10px] font-bold px-2 py-0.5 rounded-full">{totalRechazados} rechazados</span>
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-[#F7F8FA] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <p className="text-[13px] text-gray-400 font-medium">No hay solicitudes de crédito registradas</p>
              <p className="text-[11px] text-gray-300 mt-1">Las solicitudes de clientes aparecerán aquí automáticamente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-[#F7F8FA]">
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">Cliente</th>
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-3 py-2.5 text-right">Monto</th>
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-3 py-2.5 text-center">Plazo</th>
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-3 py-2.5 text-center">Ratio C/I</th>
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-3 py-2.5 text-center">Score</th>
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-3 py-2.5 text-center">Mora / Atraso</th>
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-3 py-2.5 text-center">Eval.</th>
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-3 py-2.5 text-center">Estado</th>
                    <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-3 py-2.5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F5]">
                  {filteredList.map((c, i) => {
                    const ratioNum = parseFloat(c.ratio_cuota_ingreso) || 0;
                    const isExpanded = expanded === i;
                    return (
                      <tr
                        key={i}
                        onClick={() => setExpanded(isExpanded ? null : i)}
                        className={`cursor-pointer transition-colors ${isExpanded ? 'bg-[#F0F5FB]' : 'hover:bg-[#FAFBFC]'}`}
                      >
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-semibold text-[#072146]">{c.nombre_completo}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{c.dni} · {c.fecha_solicitud}</p>
                          {isExpanded && (
                            <div className="mt-2 p-3 bg-white rounded-xl border border-[#EAECF0] text-[11px] space-y-1.5" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">Segmento:</span>
                                <Badge variant={c.segmento}>{c.segmento}</Badge>
                              </div>
                              <p><span className="text-gray-400">Ingresos Declarados (Cliente):</span> <span className="font-semibold">S/ {Number(c.ingresos_declarados || c.ingreso || 0).toLocaleString()}</span></p>
                              <p><span className="text-gray-400">Gastos Declarados (Cliente):</span> <span className="font-semibold">S/ {Number(c.gastos_declarados || 0).toLocaleString()}</span></p>
                              <p><span className="text-gray-400">Cuota mensual:</span> <span className="font-semibold text-[#004481]">S/ {Number(c.cuota).toLocaleString()}</span></p>
                              <p><span className="text-gray-400">Propósito:</span> <span className="font-semibold">{c.proposito || 'No especificado'}</span></p>
                              <p><span className="text-gray-400">SBS:</span> <span className="font-semibold">{c.entidades_sbs} entidades · {c.calificacion_sbs} · Deuda S/ {Number(c.deuda_sbs).toLocaleString()}</span></p>
                              
                              {Number(c.max_dias_atraso) > 0 ? (
                                <p>
                                  <span className="text-gray-400">Mora exacta calculada:</span>{' '}
                                  <span className="font-bold text-[#DC2626]">
                                    S/ {Number(c.mora_exacta).toFixed(2)} ({c.max_dias_atraso} días de atraso)
                                  </span>
                                </p>
                              ) : (
                                <p>
                                  <span className="text-gray-400">Mora exacta calculada:</span>{' '}
                                  <span className="font-semibold text-[#0F6E56]">S/ 0.00 (Sin mora)</span>
                                </p>
                              )}

                              {c.propuesta_evaluador && (
                                <div className="mt-2 p-2.5 bg-[#EEF3FB]/50 border border-[#004481]/10 rounded-xl space-y-1">
                                  <p className="font-bold text-[#004481] text-[9.5px] uppercase tracking-[0.5px]">Informe del Evaluador:</p>
                                  <p className="text-[10.5px]">Ingresos: <span className="font-bold text-gray-700">S/ {Number(c.ingresos_evaluador).toLocaleString()}</span> | Gastos: <span className="font-bold text-gray-700">S/ {Number(c.gastos_evaluador).toLocaleString()}</span></p>
                                  <p className="text-[10.5px]">Propuesta: <span className={`font-bold uppercase ${c.propuesta_evaluador === 'aprobado' ? 'text-[#0F6E56]' : 'text-[#DC2626]'}`}>{c.propuesta_evaluador}</span></p>
                                  {c.observacion && <p className="text-[10.5px] italic text-gray-500">"{c.observacion}"</p>}
                                </div>
                              )}
                              
                              {c.fecha_eval && (
                                <p>
                                  <span className="text-gray-400">Última resolución:</span>{' '}
                                  <span className="font-semibold">{c.fecha_eval} (por {c.evaluado_por || 'Comité'})</span>
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-[12px] font-bold text-[#072146] text-right">S/ {Number(c.monto).toLocaleString()}</td>
                        <td className="px-3 py-3 text-[12px] text-gray-500 text-center">{c.plazo}m</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-[11px] font-bold ${ratioNum > 40 ? 'text-[#DC2626]' : ratioNum > 30 ? 'text-[#92400E]' : 'text-[#0F6E56]'}`}>
                            {c.ratio_cuota_ingreso}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`text-[11px] font-bold ${Number(c.score) >= 600 ? 'text-[#0F6E56]' : Number(c.score) >= 400 ? 'text-[#92400E]' : 'text-[#DC2626]'}`}>
                            {c.score}
                          </span>
                        </td>
                        {/* Mora/Atraso column */}
                        <td className="px-3 py-3 text-center">
                          {Number(c.max_dias_atraso) > 0 ? (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-[11.5px] font-bold text-[#DC2626]">
                                S/ {Number(c.mora_exacta).toFixed(2)}
                              </span>
                              <span className="text-[8.5px] text-[#DC2626] font-bold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                                {c.max_dias_atraso} días
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center">
                              <span className="text-[11.5px] text-gray-400 font-medium">
                                S/ 0.00
                              </span>
                              <span className="text-[8.5px] text-gray-400 font-medium mt-0.5">
                                Al día
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center"><Badge variant={c.evaluacion_auto}>{c.evaluacion_auto}</Badge></td>
                        <td className="px-3 py-3 text-center">
                          {c.estado === 'pendiente' && c.propuesta_evaluador ? (
                            <Badge variant="propuesto">Propuesto</Badge>
                          ) : (
                            <Badge variant={c.estado}>{c.estado}</Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {c.estado === 'pendiente' ? (
                            !isAdmin ? (
                              // Asesor / Evaluator action
                              c.propuesta_evaluador ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setModal(c); }}
                                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-gray-200/60 transition-all whitespace-nowrap"
                                >
                                  Ver Propuesta
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setModal(c); }}
                                  className="bg-[#004481] hover:bg-[#003366] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow"
                                >
                                  Evaluar
                                </button>
                              )
                            ) : (
                              // Administrador / Comité action
                              c.propuesta_evaluador ? (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setModal(c); }}
                                  className="bg-[#0F6E56] hover:bg-[#0d5f4a] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow"
                                >
                                  Resolver
                                </button>
                              ) : (
                                <span className="text-[9.5px] text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-1.5 rounded-lg font-semibold inline-block whitespace-nowrap">
                                  Falta Propuesta
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-[10px] text-gray-300 font-semibold bg-gray-50 border border-gray-100 px-2 py-1.5 rounded-lg">
                              Finalizado
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar derecho */}
        <div className="space-y-4">
          {/* Por propósito */}
          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <p className="text-[13px] font-bold text-[#072146] mb-3">Solicitudes por propósito</p>
            {propositos.length === 0 ? (
              <p className="text-[11px] text-gray-400 text-center py-4">Sin datos aún</p>
            ) : (
              <div className="space-y-2.5">
                {propositos.map((p, i) => {
                  const maxMonto = Math.max(...propositos.map(x => Number(x.monto_total) || 1));
                  const pct = Math.round((Number(p.monto_total) / maxMonto) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-[#072146] truncate max-w-[140px]">{p.proposito}</span>
                        <span className="text-gray-400 shrink-0">{p.cantidad} sol.</span>
                      </div>
                      <div className="h-[8px] bg-[#F0F2F5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1973B8] rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">Monto prom. S/ {Number(p.monto_promedio).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Criterios de evaluación */}
          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <p className="text-[13px] font-bold text-[#072146] mb-3">Criterios de evaluación automática</p>
            <div className="space-y-2">
              <div className="bg-[#E6F7F0] rounded-[10px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="VIABLE">VIABLE</Badge>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed">Score &ge; 400, ratio C/I &le; 40%, SBS Normal, &lt; 4 entidades</p>
              </div>
              <div className="bg-[#FEF3C7] rounded-[10px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="REVISAR">REVISAR</Badge>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed">Score &lt; 400, ratio C/I &gt; 40%, calificación CPP</p>
              </div>
              <div className="bg-red-50 rounded-[10px] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="RECHAZAR">RECHAZAR</Badge>
                </div>
                <p className="text-[10px] text-gray-600 leading-relaxed">4+ entidades SBS, calificación Deficiente/Dudoso/Pérdida</p>
              </div>
            </div>
          </div>

          {/* Indicadores de riesgo */}
          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <p className="text-[13px] font-bold text-[#072146] mb-3">Indicadores clave (funcionario)</p>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1.5 border-b border-[#F0F2F5]">
                <span className="text-gray-400">Ratio C/I máximo recomendado</span>
                <span className="font-bold text-[#072146]">30%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0F2F5]">
                <span className="text-gray-400">Score mínimo para aprobar</span>
                <span className="font-bold text-[#072146]">400 pts</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0F2F5]">
                <span className="text-gray-400">Entidades SBS máx. toleradas</span>
                <span className="font-bold text-[#072146]">3</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-400">Tasa de evaluación (TEA)</span>
                <span className="font-bold text-[#072146]">35%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default P5Creditos;
