'use client';

type Props = {
  alarmas: any[];
};

export default function BannerAlarmas({ alarmas }: Props) {
  if (alarmas.length === 0) return null;

  return (
    <div className="mb-6 bg-red-950/40 border border-red-800 text-red-400 rounded-xl p-4 text-xs animate-pulse">
      <span className="font-black uppercase tracking-widest text-[10px] block mb-1">🚨 Alertas del Sistema en Tiempo Real:</span>
      <ul className="list-disc pl-4 font-mono text-[11px] space-y-0.5">
        {alarmas.map((al, idx) => (
          <li key={idx}>
            <strong>{al.fecha.split('T')[1] || al.fecha}:</strong> {al.mensaje}
          </li>
        ))}
      </ul>
    </div>
  );
}
