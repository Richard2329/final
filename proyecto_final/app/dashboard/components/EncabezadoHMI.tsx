'use client';

import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { cerrarSesion } from '@/lib/services/auth';
import type { PerfilUsuario } from '@/lib/services/auth';

type Props = {
  perfil: PerfilUsuario | null;
  onSincronizar: () => void;
};

export default function EncabezadoHMI({ perfil, onSincronizar }: Props) {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const manejarCerrarSesion = async () => {
    await cerrarSesion(supabase);
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-black tracking-wider text-white">Planta Industrial — Consola de Control HMI / SCADA</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">Gestión activa de órdenes de empaque y analítica integrada</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-[#131a2e] border border-slate-800 rounded-lg p-1.5 px-3 flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Usuario:</span>
          <span className="text-blue-400 font-bold">{perfil?.nombre || 'Cargando...'}</span>
          <span className="text-slate-600">|</span>
          <span className="text-purple-400 font-bold uppercase text-[10px]">{perfil?.rol || '—'}</span>
        </div>
        <button onClick={onSincronizar} className="px-4 py-2 bg-[#1e293b] hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition-all shadow-md">
          🔄 Sincronizar Planta
        </button>
        <button onClick={manejarCerrarSesion} className="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-bold rounded-lg border border-red-900 transition-all shadow-md">
          🚪 Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
