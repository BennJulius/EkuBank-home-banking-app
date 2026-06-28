import { useState } from 'react';

const KPI = ({ label, value, sub, accent }) => (
  <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5 hover:shadow-md transition-shadow">
    <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
    <p className={`text-[28px] font-bold leading-none tracking-tight ${accent ? 'text-[#0F6E56]' : 'text-[#072146]'}`}>{value}</p>
    {sub && <p className={`text-[11px] mt-1.5 ${accent ? 'text-[#0F6E56]/70' : 'text-gray-400'}`}>{sub}</p>}
  </div>
);

const segColors = { PREMIER: '#004481', ESTANDAR: '#1973B8', BASICO: '#5DADE2' };
const barColors = ['#1D9E75', '#49D0A0', '#F0AD4E', '#49D0A0', '#1D9E75'];
const barLabels = ['Saldo (max 200)', 'Regularidad (max 160)', 'Disciplina (max 160)', 'Vínculo (max 160)', 'Riesgo SBS (max 120)'];
const barMax = [200, 160, 160, 160, 120];

const P1Resumen = ({ apiData }) => {
  const r = apiData?.resumen || {};
  const deps = apiData?.departamentos || [];
  const segs = apiData?.segmentos || [];
  const sc = apiData?.scoring_componentes || {};
  const clientesLista = apiData?.clientes_lista || [];
  const porDepto = apiData?.por_departamento || [];

  const [filtroDep, setFiltroDep] = useState('Todos');
  const [filtroSeg, setFiltroSeg] = useState('Todos');

  const filteredClientes = clientesLista.filter(c => {
    if (filtroDep !== 'Todos' && c.departamento !== filtroDep) return false;
    if (filtroSeg !== 'Todos' && c.segmento !== filtroSeg) return false;
    return true;
  });

  const filteredSegs = filtroSeg === 'Todos'
    ? segs
    : segs.filter(s => s.segmento === filtroSeg);

  const filteredDeptos = filtroDep === 'Todos'
    ? porDepto
    : porDepto.filter(d => d.departamento === filtroDep);

  const totalClientes = filteredSegs.reduce((a, s) => a + Number(s.cantidad), 0) || (filtroSeg === 'Todos' && filtroDep === 'Todos' ? Number(r.total_clientes) || 0 : 0);
  const scoreFields = ['pts_saldo', 'pts_regularidad', 'pts_disciplina', 'pts_vinculo', 'pts_riesgo'];

  const filterLabel = [filtroDep !== 'Todos' ? filtroDep : null, filtroSeg !== 'Todos' ? filtroSeg : null].filter(Boolean).join(' · ') || 'Todos';

  return (
    <div className="space-y-5">
      <div className="bg-white border border-[#EAECF0] rounded-[14px] px-5 py-3 flex items-center gap-4 flex-wrap">
        <p className="text-[11px] font-semibold text-[#004481] uppercase tracking-[1px]">Filtros</p>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-gray-400 font-medium">Departamento</label>
          <select value={filtroDep} onChange={(e) => setFiltroDep(e.target.value)}
            className="text-[11px] border border-[#E0E6ED] rounded-lg px-2.5 py-1.5 outline-none bg-[#F8FAFC] focus:border-[#1973B8]">
            <option>Todos</option>{deps.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] text-gray-400 font-medium">Segmento</label>
          <select value={filtroSeg} onChange={(e) => setFiltroSeg(e.target.value)}
            className="text-[11px] border border-[#E0E6ED] rounded-lg px-2.5 py-1.5 outline-none bg-[#F8FAFC] focus:border-[#1973B8]">
            <option>Todos</option><option>PREMIER</option><option>ESTANDAR</option><option>BASICO</option>
          </select>
        </div>
        {(filtroDep !== 'Todos' || filtroSeg !== 'Todos') && (
          <button onClick={() => { setFiltroDep('Todos'); setFiltroSeg('Todos'); }}
            className="text-[10px] text-red-500 hover:text-red-700 font-semibold ml-auto">
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPI label="Total clientes evaluados" value={totalClientes.toLocaleString()} sub={`Filtro: ${filterLabel}`} />
        <KPI label="Score transaccional promedio" value={Number(r.score_promedio || 0).toFixed(0)} sub="de 800 puntos posibles" />
        <KPI label="Monto hipótesis promedio" value={`S/ ${Number(r.ticket_promedio || 0).toLocaleString()}`} sub="Solo clientes elegibles" accent />
        <KPI label="Monto hipótesis total" value={`S/ ${(Number(r.monto_preaprobado || 0) / 1000000).toFixed(2)}M`} sub="Potencial de colocación" accent />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
          <p className="text-[13px] font-bold text-[#072146] mb-1">Distribución por segmento preliminar</p>
          <p className="text-[10px] text-gray-400 mb-4">Datos reales · perfiles_clientes</p>

          {totalClientes > 0 && (
            <div className="flex h-8 rounded-[10px] overflow-hidden mb-3 shadow-inner">
              {filteredSegs.map((s, i) => {
                const pct = ((Number(s.cantidad) / totalClientes) * 100).toFixed(0);
                const color = segColors[s.segmento] || '#E0E6ED';
                return (
                  <div key={i} className="flex items-center justify-center text-[10px] font-bold text-white transition-all hover:opacity-80"
                    style={{ width: `${pct}%`, background: color, minWidth: pct > 5 ? 'auto' : '20px' }}>
                    {pct > 8 ? `${pct}%` : ''}
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {filteredSegs.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="w-2.5 h-2.5 rounded" style={{ background: segColors[s.segmento] || '#E0E6ED' }} />
                {s.segmento || 'Sin segmento'} — {s.cantidad}
              </div>
            ))}
          </div>

          {filteredDeptos.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#F0F2F5]">
              <p className="text-[12px] font-semibold text-[#072146] mb-2">Por departamento</p>
              {filteredDeptos.map((d, i) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] text-gray-500 w-24 truncate">{d.departamento}</span>
                  <div className="flex-1 h-2 bg-[#F0F2F5] rounded-full">
                    <div className="h-full bg-[#1973B8] rounded-full" style={{ width: `${Math.min((Number(d.cantidad) / Math.max(...filteredDeptos.map(x => Number(x.cantidad)))) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-400 w-6 text-right">{d.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
          <p className="text-[13px] font-bold text-[#072146] mb-1">Puntaje promedio por grupo de scoring</p>
          <p className="text-[10px] text-gray-400 mb-4">Calculado desde scores_transaccionales</p>
          <div className="space-y-2.5">
            {scoreFields.map((field, i) => {
              const pts = Number(sc?.[field] || 0);
              const pct = barMax[i] > 0 ? Math.min(Math.round((pts / barMax[i]) * 100), 100) : 0;
              return (
                <div key={field} className="flex items-center gap-2.5">
                  <span className="text-[11px] text-gray-500 w-[130px] text-right shrink-0 font-medium">{barLabels[i]}</span>
                  <div className="flex-1 h-[26px] bg-[#F0F2F5] rounded-[8px] overflow-hidden">
                    <div className="h-full flex items-center px-2.5 text-[10px] font-bold text-white rounded-[8px] transition-all"
                      style={{ width: `${pct}%`, background: barColors[i], minWidth: pts > 0 ? '40px' : '0' }}>
                      {pts} pts
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-400 w-[32px] text-right shrink-0 font-mono">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default P1Resumen;
