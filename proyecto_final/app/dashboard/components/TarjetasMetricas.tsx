'use client';

type Props = {
  estadoCelda: string;
  ultimoLoteId: string;
  eficienciaOEE: number;
  aceptados: number;
  rechazados: number;
  registroMermas: number;
};

export default function TarjetasMetricas({ estadoCelda, ultimoLoteId, eficienciaOEE, aceptados, rechazados, registroMermas }: Props) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-[#131a2e] border border-slate-800 p-4 rounded-xl shadow-lg">
        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Estado de Celda</p>
        <p className={`text-xl font-black mt-1 flex items-center gap-2 ${estadoCelda.includes('CRÍTICO') ? 'text-red-400' : 'text-white'}`}>
          <span className={`w-2.5 h-2.5 rounded-full bg-blue-500 ${estadoCelda.includes('CRÍTICO') ? 'bg-red-500' : 'animate-pulse'}`}></span>
          {estadoCelda}
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          Último Lote: <span className="font-mono text-blue-400">{ultimoLoteId}</span>
        </p>
      </div>

      <div className="bg-[#131a2e] border border-slate-800 p-4 rounded-xl shadow-lg">
        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Eficiencia de Calidad (OEE)</p>
        <p className="text-3xl font-black text-amber-400 mt-1">{eficienciaOEE}%</p>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-amber-400 h-full transition-all" style={{ width: `${eficienciaOEE}%` }}></div>
        </div>
      </div>

      <div className="bg-[#131a2e] border border-slate-800 p-4 rounded-xl shadow-lg">
        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Balance de Envases</p>
        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="text-lg font-black text-emerald-400">{aceptados}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold">Aceptados</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-red-400">{rechazados}</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold">Rechazados</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-1 border-t border-slate-800 pt-1">Total: {aceptados + rechazados} und</p>
      </div>

      <div className="bg-[#131a2e] border border-slate-800 p-4 rounded-xl shadow-lg">
        <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Registro de Mermas</p>
        <p className="text-2xl font-black text-red-500 mt-1">{registroMermas} g</p>
        <p className="text-[11px] text-slate-400 mt-2">Desviación neta acumulada en celdas</p>
      </div>
    </section>
  );
}
