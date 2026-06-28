import { useState } from 'react';

const KPI = ({ label, value, sub, accent }) => (
  <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5 hover:shadow-md transition-shadow">
    <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
    <p className={`text-[28px] font-bold leading-none tracking-tight ${accent ? 'text-[#0F6E56]' : 'text-[#072146]'}`}>{value}</p>
    {sub && <p className={`text-[11px] mt-1.5 ${accent ? 'text-[#0F6E56]/70' : 'text-gray-400'}`}>{sub}</p>}
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const s = {
    PREMIER: 'bg-[#EEF3FB] text-[#004481]',
    ESTANDAR: 'bg-[#E6F7F0] text-[#0F6E56]',
    BASICO: 'bg-[#FEF3C7] text-[#92400E]',
    default: 'bg-[#F0F2F5] text-gray-600',
  };
  return <span className={`${s[variant] || s.default} px-2.5 py-0.5 rounded-md text-[10px] font-bold`}>{children}</span>;
};

const P2Perfil = ({ apiData }) => {
  const p = apiData?.perfiles || [];
  const deps = apiData?.departamentos || [];
  const clientes = apiData?.clientes_lista || [];
  const porDepto = apiData?.por_departamento || [];

  const [filtroDep, setFiltroDep] = useState('Todos');
  const [filtroSeg, setFiltroSeg] = useState('Todos');

  const filteredClientes = clientes.filter(c => {
    if (filtroDep !== 'Todos' && c.departamento !== filtroDep) return false;
    if (filtroSeg !== 'Todos' && c.segmento !== filtroSeg) return false;
    return true;
  });

  const filteredPerfiles = filtroSeg === 'Todos' ? p : p.filter(s => s.segmento === filtroSeg);
  const filteredDeptos = filtroDep === 'Todos' ? porDepto : porDepto.filter(d => d.departamento === filtroDep);

  const dataForKPIs = filteredPerfiles.length > 0 ? filteredPerfiles : p;
  const avgIngreso = dataForKPIs.length > 0 ? dataForKPIs.reduce((a, s) => a + Number(s.ingresos_est || 0) * Number(s.cantidad || 1), 0) / dataForKPIs.reduce((a, s) => a + Number(s.cantidad || 1), 0) : 0;
  const avgSaldo = dataForKPIs.length > 0 ? dataForKPIs.reduce((a, s) => a + Number(s.saldo_prom || 0) * Number(s.cantidad || 1), 0) / dataForKPIs.reduce((a, s) => a + Number(s.cantidad || 1), 0) : 0;
  const avgAntiguedad = dataForKPIs.length > 0 ? dataForKPIs.reduce((a, s) => a + Number(s.antiguedad_prom || 0) * Number(s.cantidad || 1), 0) / dataForKPIs.reduce((a, s) => a + Number(s.cantidad || 1), 0) : 0;
  const ratioAhorro = avgIngreso > 0 ? ((avgSaldo / avgIngreso) * 100).toFixed(1) : '0.0';
  const maxDepto = filteredDeptos.length > 0 ? Math.max(...filteredDeptos.map(d => Number(d.cantidad))) : 1;

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
        <KPI label="Ingreso promedio mensual" value={`S/ ${Math.round(avgIngreso).toLocaleString()}`} sub="Datos reales" />
        <KPI label="Saldo promedio en cuenta" value={`S/ ${Math.round(avgSaldo).toLocaleString()}`} sub="Datos reales" />
        <KPI label="Antigüedad promedio" value={`${Math.round(avgAntiguedad)} meses`} sub="antiguedad_cuenta_meses" />
        <KPI label="Ratio ahorro neto prom." value={`${ratioAhorro}%`} sub="saldo / ingreso" accent />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
          <p className="text-[13px] font-bold text-[#072146] mb-1">Clientes con mejor score</p>
          <p className="text-[10px] text-gray-400 mb-3">Top 20 · Datos reales de la BD {filteredClientes.length !== clientes.length ? `(${filteredClientes.length} filtrados)` : ''}</p>
          <div className="overflow-hidden rounded-[10px] border border-[#EAECF0]">
            <table className="w-full text-left">
              <thead><tr className="bg-[#F7F8FA]">
                <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">Cliente</th>
                <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">Dpto.</th>
                <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Ingreso</th>
                <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-center">Seg.</th>
              </tr></thead>
              <tbody className="divide-y divide-[#F0F2F5]">
                {filteredClientes.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-[12px] text-gray-400">Sin datos de clientes para este filtro</td></tr>
                ) : filteredClientes.slice(0, 8).map((c, i) => (
                  <tr key={i} className="hover:bg-[#FAFBFC] transition-colors">
                    <td className="px-4 py-2.5 text-[12px] font-semibold text-[#072146]">{c.nombre_corto}</td>
                    <td className="px-4 py-2.5 text-[12px] text-gray-500">{c.departamento || '—'}</td>
                    <td className="px-4 py-2.5 text-[12px] text-right font-medium">S/ {Number(c.ingreso).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-center"><Badge variant={c.segmento}>{c.segmento}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <p className="text-[13px] font-bold text-[#072146] mb-3">Clientes por departamento</p>
            <div className="overflow-hidden rounded-[10px] border border-[#EAECF0]">
              <table className="w-full text-left">
                <thead><tr className="bg-[#F7F8FA]">
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">Dpto.</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Clientes</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">Distribución</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Score</th>
                </tr></thead>
                <tbody className="divide-y divide-[#F0F2F5]">
                  {filteredDeptos.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-[12px] text-gray-400">Sin datos</td></tr>
                  ) : filteredDeptos.map((d, i) => (
                    <tr key={i} className="hover:bg-[#FAFBFC]">
                      <td className="px-4 py-2.5 text-[12px] font-medium text-[#072146]">{d.departamento}</td>
                      <td className="px-4 py-2.5 text-[12px] text-gray-500 text-right">{d.cantidad}</td>
                      <td className="px-4 py-2.5"><div className="h-2.5 bg-[#F0F2F5] rounded-full"><div className="h-full bg-[#1973B8] rounded-full" style={{ width: `${(Number(d.cantidad) / maxDepto * 100).toFixed(0)}%` }} /></div></td>
                      <td className="px-4 py-2.5 text-[12px] text-[#004481] font-bold text-right">{d.score_prom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[#EAECF0] rounded-[16px] p-5">
            <p className="text-[13px] font-bold text-[#072146] mb-3">Indicadores financieros por segmento</p>
            <div className="overflow-hidden rounded-[10px] border border-[#EAECF0]">
              <table className="w-full text-left">
                <thead><tr className="bg-[#F7F8FA]">
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5">Segmento</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Ingreso</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Saldo</th>
                  <th className="text-[10px] text-gray-400 font-semibold uppercase tracking-[0.5px] px-4 py-2.5 text-right">Score</th>
                </tr></thead>
                <tbody className="divide-y divide-[#F0F2F5]">
                  {filteredPerfiles.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-[12px] text-gray-400">Sin datos para este filtro</td></tr>
                  ) : filteredPerfiles.map((s, i) => (
                    <tr key={i} className="hover:bg-[#FAFBFC]">
                      <td className="px-4 py-2.5"><Badge variant={s.segmento}>{s.segmento}</Badge></td>
                      <td className="px-4 py-2.5 text-[12px] text-[#004481] font-semibold text-right">S/ {Number(s.ingresos_est || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#004481] font-semibold text-right">S/ {Number(s.saldo_prom || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#072146] font-bold text-right">{s.score_prom || '—'}</td>
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

export default P2Perfil;
