const KPI = ({ label, value, accent }) => (
  <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5 hover:shadow-md transition-shadow">
    <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
    <p className={`text-[28px] font-bold leading-none tracking-tight ${accent ? 'text-[#0F6E56]' : 'text-[#072146]'}`}>{value}</p>
  </div>
);

const barColors = ['#1D9E75', '#1D9E75', '#49D0A0', '#F0AD4E', '#DC2626'];

const P3Negocio = ({ apiData }) => {
  const n = apiData?.negocios || [];
  const kpis = apiData?.negocio_kpis || {};
  const perfiles = apiData?.perfiles || [];

  const ingresoGlobal = Number(kpis.ingreso_global || 0);
  const cuotaMax = Number(kpis.cuota_maxima || 0);
  const saldoGlobal = Number(kpis.saldo_global || 0);
  const maxCantidad = n.length > 0 ? Math.max(...n.map(x => Number(x.cantidad))) : 1;

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#EAECF0] rounded-[14px] px-5 py-3 flex items-center gap-4 flex-wrap">
        <p className="text-[11px] font-semibold text-[#004481] uppercase tracking-[1px]">Análisis por antigüedad</p>
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-[11px] text-gray-400">Datos reales de perfiles_clientes</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Ingreso promedio global" value={`S/ ${ingresoGlobal.toLocaleString()}`} />
        <KPI label="Cuota máxima (30% ingreso)" value={`S/ ${cuotaMax.toLocaleString()}`} />
        <KPI label="Saldo promedio global" value={`S/ ${saldoGlobal.toLocaleString()}`} />
        <KPI label="Grupos por antigüedad" value={n.length} accent />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Barras por antigüedad — DATOS REALES */}
        <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
          <p className="text-[13px] font-bold text-[#072146] mb-1">Score e ingreso por antigüedad de cuenta</p>
          <p className="text-[10px] text-gray-400 mb-4">Datos reales · antiguedad_cuenta_meses</p>
          <div className="space-y-3">
            {n.length === 0 ? (
              <p className="text-[12px] text-gray-400 text-center py-4">Sin datos de antigüedad</p>
            ) : n.map((b, i) => {
              const pct = Math.round((Number(b.cantidad) / maxCantidad) * 100);
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-[11px] text-gray-500 w-[130px] text-right shrink-0 font-medium">{b.antiguedad} ({b.cantidad})</span>
                  <div className="flex-1 h-[28px] bg-[#F0F2F5] rounded-[8px] overflow-hidden">
                    <div className="h-full flex items-center px-2.5 text-[10px] font-bold text-white rounded-[8px]"
                      style={{ width: `${pct}%`, background: barColors[i] || '#1973B8', minWidth: '50px' }}>
                      {b.score_prom} pts · S/{Number(b.ingreso_prom || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {/* Capacidad de pago por segmento — DATOS REALES */}
          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <p className="text-[13px] font-bold text-[#072146] mb-4">Capacidad de pago por segmento</p>
            <div className="space-y-3">
              {perfiles.length === 0 ? (
                <p className="text-[12px] text-gray-400 text-center py-4">Sin datos de segmento</p>
              ) : perfiles.map((s, i) => {
                const ingreso = Number(s.ingresos_est || 0);
                const montoMax = Math.round(ingreso * 0.30 * Number(s.antiguedad_prom || 12));
                const techo = s.segmento === 'PREMIER' ? 5000 : s.segmento === 'ESTANDAR' ? 2500 : 1500;
                const monto = Math.min(montoMax, techo);
                const colors = { PREMIER: { bg: '#EEF3FB', text: '#004481' }, ESTANDAR: { bg: '#E6F7F0', text: '#0F6E56' }, BASICO: { bg: '#FEF3C7', text: '#92400E' } };
                const c = colors[s.segmento] || colors.BASICO;
                return (
                  <div key={i}>
                    <p className="text-[11px] text-gray-400 font-medium mb-1.5">{s.segmento} ({s.cantidad} clientes)</p>
                    <div className="rounded-[10px] px-4 py-3 flex justify-between items-center" style={{ background: c.bg }}>
                      <span className="text-[12px] font-medium" style={{ color: c.text }}>Monto hipótesis (techo S/{techo.toLocaleString()})</span>
                      <span className="text-[15px] font-bold" style={{ color: c.text }}>S/ {monto.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabla antigüedad — DATOS REALES */}
          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <p className="text-[13px] font-bold text-[#072146] mb-3">Detalle por antigüedad de cuenta</p>
            <div className="overflow-hidden rounded-[10px] border border-[#EAECF0]">
              <table className="w-full text-left">
                <thead><tr className="bg-[#F7F8FA]">
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">Rango</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Clientes</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Score</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Saldo</th>
                </tr></thead>
                <tbody className="divide-y divide-[#F0F2F5]">
                  {n.map((r, i) => (
                    <tr key={i} className="hover:bg-[#FAFBFC]">
                      <td className="px-4 py-2.5 text-[12px] font-semibold text-[#072146]">{r.antiguedad}</td>
                      <td className="px-4 py-2.5 text-[12px] text-gray-500 text-right">{r.cantidad}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#004481] font-bold text-right">{r.score_prom}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#0F6E56] font-bold text-right">S/ {Number(r.saldo_prom || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default P3Negocio;
