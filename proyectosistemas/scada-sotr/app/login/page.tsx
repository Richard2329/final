'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { iniciarSesion } from '@/lib/services/auth';

export default function LoginPage() {
  const router = useRouter();
  const supabase = crearClienteNavegador();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manejarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const resultado = await iniciarSesion(supabase, correo, password);

    setCargando(false);

    if (!resultado.ok) {
      setError(resultado.error || 'No se pudo iniciar sesión.');
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#131a2e] border border-slate-800 rounded-xl p-8 shadow-xl">
        <h1 className="text-xl font-black text-white tracking-wider text-center mb-1">SCADA-SOTR</h1>
        <p className="text-xs text-slate-400 text-center mb-6">Consola de Control de Planta</p>

        <form onSubmit={manejarSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase">Correo</label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="operador@planta.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800 text-red-400 rounded-lg p-2.5 text-xs font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs p-2.5 rounded-lg transition-all"
          >
            {cargando ? 'Verificando...' : '🔐 Ingresar a la Planta'}
          </button>
        </form>
      </div>
    </div>
  );
}
