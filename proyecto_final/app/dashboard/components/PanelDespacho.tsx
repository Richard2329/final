'use client';

import { useState } from 'react';
import type { PerfilUsuario } from '@/lib/services/auth';

type Props = {
  catalogoProductos: any[];
  inventario: any[];
  perfil: PerfilUsuario | null;
  onOrdenCreada: () => void;
};

type MensajeHMI = { tipo: 'exito' | 'error' | 'info'; texto: string } | null;

export default function PanelDespacho({ catalogoProductos, inventario, perfil, onOrdenCreada }: Props) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>(catalogoProductos[0]?.nombre || '');
  const [pesoPresentacion, setPesoPresentacion] = useState<number>(25);
  const [tamanoLoteInput, setTamanoLoteInput] = useState<number>(10);
  const [mensajeHMI, setMensajeHMI] = useState<MensajeHMI>(null);
  const [enviando, setEnviando] = useState(false);

  const manejarDespacho = async () => {
    setMensajeHMI(null);

    if (perfil?.rol === 'operador') {
      setMensajeHMI({ tipo: 'error', texto: 'ACCESO DENEGADO: El rol de Operador solo tiene permisos de lectura HMI.' });
      return;
    }

    const materiaAsociada = inventario.find((i) =>
      (i.nombre_materia || '').toLowerCase().includes(productoSeleccionado.toLowerCase())
    );
    const gramosRequeridos = pesoPresentacion * tamanoLoteInput;
    const kilosRequeridos = gramosRequeridos / 1000;

    if (materiaAsociada && Number(materiaAsociada.cantidad_disponible) < kilosRequeridos) {
      setMensajeHMI({
        tipo: 'error',
        texto: `FALLO DE ENCLAVAMIENTO: Stock insuficiente de ${productoSeleccionado}. Requerido: ${kilosRequeridos}Kg, Disponible: ${materiaAsociada.cantidad_disponible}Kg.`,
      });
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await fetch('/api/produccion/iniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producto: productoSeleccionado,
          tamano_lote: tamanoLoteInput,
          fecha: new Date().toISOString(),
        }),
      });
      const resultado = await respuesta.json();

      if (!resultado.ok) {
        setMensajeHMI({ tipo: 'error', texto: `Error al crear la orden: ${resultado.error || 'desconocido'}` });
      } else {
        setMensajeHMI({
          tipo: 'exito',
          texto: `ORDEN DESPACHADA: Lote de ${resultado.tamanoValidado} unidades de ${productoSeleccionado} (${gramosRequeridos}g netos) creado en Supabase.`,
        });
        onOrdenCreada();
      }
    } catch (error) {
      setMensajeHMI({ tipo: 'error', texto: 'No se pudo conectar con el servidor para crear la orden.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="bg-[#131a2e] border border-slate-800/80 rounded-xl p-5 mb-6 shadow-xl">
      <h2 className="text-xs font-bold text-white tracking-widest uppercase mb-4 flex items-center gap-2">
        🕹️ Panel de Despacho y Control de Procesos (HMI)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase">1. Seleccionar Producto</label>
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-none"
          >
            {catalogoProductos.map((producto) => (
              <option key={producto.id_producto} value={producto.nombre}>
                {producto.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase">2. Peso de Presentación</label>
          <select
            onChange={(e) => setPesoPresentacion(Number(e.target.value))}
            className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-none"
          >
            <option value={25}>25 gramos (Estándar)</option>
            <option value={50}>50 gramos</option>
            <option value={100}>100 gramos</option>
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase">3. Tamaño del Lote</label>
          <input
            type="number"
            value={tamanoLoteInput}
            onChange={(e) => setTamanoLoteInput(Math.max(1, Number(e.target.value)))}
            className="w-full bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={manejarDespacho}
          disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs p-2.5 rounded-lg transition-all shadow-md"
        >
          {enviando ? '⏳ Enviando...' : '⚙️ Iniciar Proceso en Planta'}
        </button>
      </div>

      {mensajeHMI && (
        <div
          className={`mt-4 p-3 rounded-lg text-xs font-mono font-bold border ${
            mensajeHMI.tipo === 'exito' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400' : 'bg-red-950/40 border-red-800 text-red-400'
          }`}
        >
          {mensajeHMI.texto}
        </div>
      )}
    </section>
  );
}
