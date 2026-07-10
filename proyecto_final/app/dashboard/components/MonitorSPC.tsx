'use client';

type Props = {
  historicoBolsas: any[];
};

export default function MonitorSPC({ historicoBolsas }: Props) {
  return (
    <section className="bg-[#131a2e] border border-slate-800 rounded-xl p-5 mb-6 shadow-xl">
      <h3 className="text-xs font-bold text-white tracking-wider mb-4 flex items-center gap-2">📊 Monitor Estadístico Rápido de Envases</h3>
      <div className="h-28 bg-[#0b0f19] border border-slate-800 rounded-xl relative flex items-end p-2">
        <div className="w-full h-full flex justify-between items-end px-4 z-10 pt-4">
          {historicoBolsas.slice(0, 12).reverse().map((b, idx) => {
            const altura = Math.min(100, (Number(b.peso_real || 0) / 35) * 100);
            return (
              <div
                key={idx}
                className="w-3 bg-blue-500/80 rounded-t hover:bg-blue-400 transition-all relative group"
                style={{ height: `${altura}%` }}
              >
                <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-[8px] p-1 rounded border border-slate-700 text-white z-50 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {b.peso_real}g
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
