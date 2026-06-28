const KPI = ({ label, value, sub, danger }) => (
  <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5 hover:shadow-md transition-shadow">
    <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
    <p className={`text-[28px] font-bold leading-none tracking-tight ${danger ? 'text-[#DC2626]' : 'text-[#072146]'}`}>{value}</p>
    {sub && <p className={`text-[11px] mt-1.5 ${danger ? 'text-[#DC2626]/70' : 'text-[#0F6E56]/80'}`}>{sub}</p>}
  </div>
);

const P4Riesgo = ({ apiData }) => {
  const s = apiData?.sbs || {};
  const sr = apiData?.sbs_resumen || {};
  const porSeg = apiData?.sbs_por_segmento || [];
  const lista = apiData?.sbs_lista || [];

  const total = Number(sr.total || 0);
  const sinDeuda = Number(sr.sin_deuda || 0);
  const conDeudaLeve = Number(sr.con_deuda_leve || 0);
  const conDeudaAlta = Number(sr.con_deuda_alta || 0);
  const cpp = Number(sr.calificacion_cpp || 0);

  const pctSin = total > 0 ? Math.round((sinDeuda / total) * 100) : 0;
  const pctLeve = total > 0 ? Math.round((conDeudaLeve / total) * 100) : 0;
  const pctAlta = total > 0 ? Math.round((conDeudaAlta / total) * 100) : 0;
  const pctCpp = total > 0 ? ((cpp / total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#EAECF0] rounded-[14px] px-5 py-3 flex items-center gap-4 flex-wrap">
        <p className="text-[11px] font-semibold text-[#004481] uppercase tracking-[1px]">Análisis de riesgo SBS</p>
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-[11px] text-gray-400">Datos reales · perfiles_clientes</span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Sin deuda en SBS" value={sinDeuda.toLocaleString()} sub={`${pctSin}% del total`} />
        <KPI label="Con entidades SBS" value={Number(s.total_sbs || 0).toLocaleString()} sub={`${100 - pctSin}% del total`} danger />
        <KPI label="Calificación CPP" value={cpp.toLocaleString()} sub={`${pctCpp}% del total`} danger />
        <KPI label="Deuda SBS total" value={`S/ ${(Number(s.deuda_total || 0) / 1000000).toFixed(2)}M`} sub="Suma deuda_total_sbs" danger />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Distribución — DATOS REALES */}
        <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
          <p className="text-[13px] font-bold text-[#072146] mb-1">Distribución por entidades SBS</p>
          <p className="text-[10px] text-gray-400 mb-4">Datos reales · num_entidades_sbs</p>
          <div className="space-y-3 mb-6">
            {[
              { n: '0 entidades', v: sinDeuda, pct: pctSin, bg: '#1D9E75' },
              { n: '1-3 entidades', v: conDeudaLeve, pct: pctLeve, bg: '#49D0A0' },
              { n: '4+ entidades', v: conDeudaAlta, pct: pctAlta, bg: '#DC2626' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[11px] text-gray-500 w-[120px] text-right shrink-0 font-medium">{b.n}</span>
                <div className="flex-1 h-[28px] bg-[#F0F2F5] rounded-[8px] overflow-hidden">
                  <div className="h-full flex items-center px-2.5 text-[10px] font-bold text-white rounded-[8px]"
                    style={{ width: `${Math.max(b.pct, 3)}%`, background: b.bg, minWidth: b.v > 0 ? '50px' : '0' }}>
                    {b.v.toLocaleString()} ({b.pct}%)
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[13px] font-bold text-[#072146] mb-3">Deuda SBS por segmento</p>
          <div className="overflow-hidden rounded-[10px] border border-[#EAECF0]">
            <table className="w-full text-left">
              <thead><tr className="bg-[#F7F8FA]">
                <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">Seg.</th>
                <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-center">Calif.</th>
                <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Deuda prom.</th>
                <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Cant.</th>
              </tr></thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {porSeg.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-[12px] text-gray-400">Sin datos SBS por segmento</td></tr>
                ) : porSeg.map((r, i) => (
                  <tr key={i} className="hover:bg-[#FAFBFC]">
                    <td className="px-4 py-2.5"><span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                      r.segmento === 'PREMIER' ? 'bg-[#EEF3FB] text-[#004481]' : r.segmento === 'ESTANDAR' ? 'bg-[#E6F7F0] text-[#0F6E56]' : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}>{r.segmento}</span></td>
                    <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      r.calificacion === 'Normal' ? 'bg-[#E6F7F0] text-[#0F6E56]' : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}>{r.calificacion}</span></td>
                    <td className="px-4 py-2.5 text-[12px] text-[#DC2626] font-semibold text-right">S/ {Number(r.deuda_promedio).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-[12px] text-gray-500 text-right">{r.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          {/* Clientes alto riesgo — DATOS REALES */}
          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[13px] font-bold text-[#072146]">Clientes de mayor riesgo SBS</p>
                <p className="text-[10px] text-gray-400">num_entidades_sbs &ge; 3 · Datos reales</p>
              </div>
              {lista.length > 0 && (
                <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-100">
                  {lista.length} alertas
                </span>
              )}
            </div>
            <div className="overflow-hidden rounded-[10px] border border-[#EAECF0]">
              <table className="w-full text-left">
                <thead><tr className="bg-[#F7F8FA]">
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">DNI</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-center">Entid.</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-center">Calific.</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Deuda</th>
                </tr></thead>
                <tbody className="divide-y divide-[#F0F2F5]">
                  {lista.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-[12px] text-gray-400">No hay clientes de alto riesgo</td></tr>
                  ) : lista.map((c, i) => (
                    <tr key={i} className="hover:bg-red-50/30">
                      <td className="px-4 py-2.5 text-[12px] font-medium text-[#072146] font-mono">{c.dni}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#DC2626] font-bold text-center">{c.entidades}</td>
                      <td className="px-4 py-2.5 text-center"><span className="bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-md text-[10px] font-bold">{c.peor_estado}</span></td>
                      <td className="px-4 py-2.5 text-[12px] text-[#DC2626] font-semibold text-right">S/ {Number(c.deuda).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Alertas — DATOS REALES */}
          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <p className="text-[13px] font-bold text-[#072146] mb-3">Alertas de decisión crediticia</p>
            <div className="space-y-2.5">
              {conDeudaAlta > 0 && (
                <div className="bg-red-50 border-l-[3px] border-[#DC2626] rounded-r-[10px] p-3.5">
                  <p className="text-[12px] font-bold text-[#DC2626] mb-0.5">{conDeudaAlta} clientes con 4+ entidades SBS</p>
                  <p className="text-[11px] text-gray-600">Requieren revisión manual. Considerar veto.</p>
                </div>
              )}
              {cpp > 0 && (
                <div className="bg-[#FFF7ED] border-l-[3px] border-[#F0AD4E] rounded-r-[10px] p-3.5">
                  <p className="text-[12px] font-bold text-[#92400E] mb-0.5">{cpp} clientes con calificación CPP</p>
                  <p className="text-[11px] text-gray-600">Monto hipótesis debe reducirse al 50%.</p>
                </div>
              )}
              {sinDeuda > 0 && (
                <div className="bg-[#E6F7F0] border-l-[3px] border-[#1D9E75] rounded-r-[10px] p-3.5">
                  <p className="text-[12px] font-bold text-[#0F6E56] mb-0.5">{sinDeuda.toLocaleString()} clientes sin deuda SBS</p>
                  <p className="text-[11px] text-gray-600">Elegibles para crédito pre-aprobado automático.</p>
                </div>
              )}
              {sinDeuda === 0 && conDeudaAlta === 0 && cpp === 0 && (
                <p className="text-[12px] text-gray-400 text-center py-4">Sin alertas activas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default P4Riesgo;
