'use client';

type Props = {
  pantallaActiva: string;
  lotesConcluidos: any[];
  historicoBolsas: any[];
  ordenesProduccion: any[];
  inventario: any[];
  catalogoProductos: any[];
  usuarios: any[];
  cargando: boolean;
  filtroTexto: string;
  filtroEstado: string;
  onFiltroTexto: (v: string) => void;
  onFiltroEstado: (v: string) => void;
  onVolver: () => void;
};

const TITULOS: Record<string, string> = {
  lotes: 'Lotes Concluidos',
  bolsas: 'Bolsas Registradas',
  ordenes: 'Órdenes de Producción',
  inventario: 'Inventario de Materias Primas',
  productos: 'Catálogo de Productos',
  usuarios: 'Usuarios del Sistema',
};

export default function TablaDatos({
  pantallaActiva,
  lotesConcluidos,
  historicoBolsas,
  ordenesProduccion,
  inventario,
  catalogoProductos,
  usuarios,
  cargando,
  filtroTexto,
  filtroEstado,
  onFiltroTexto,
  onFiltroEstado,
  onVolver,
}: Props) {
  const busqueda = filtroTexto.toLowerCase();

  const obtenerDatosFiltrados = (): any[] => {
    switch (pantallaActiva) {
      case 'lotes':
        return lotesConcluidos.filter((l) => {
          const cumpleTexto = (l.numero_lote || '').toLowerCase().includes(busqueda);
          if (filtroEstado === 'OPTIMOS') return cumpleTexto && Number(l.cantidad_rechazada) === 0;
          if (filtroEstado === 'RECHAZADOS') return cumpleTexto && Number(l.cantidad_rechazada) > 0;
          return cumpleTexto;
        });

      case 'bolsas':
        return historicoBolsas.filter((b) => {
          const cumpleTexto = (b.id_lote || '').toLowerCase().includes(busqueda);
          const cumpleSelect = filtroEstado === 'TODOS' || b.estado_llenado === filtroEstado;
          return cumpleTexto && cumpleSelect;
        });

      case 'ordenes':
        return ordenesProduccion.filter((o) => {
          const cumpleTexto = (o.id_orden || '').toString().toLowerCase().includes(busqueda);
          const cumpleSelect = filtroEstado === 'TODOS' || (o.estado || '').toLowerCase() === filtroEstado.toLowerCase();
          return cumpleTexto && cumpleSelect;
        });

      case 'inventario':
        return inventario.filter((i) => {
          const cumpleTexto = (i.nombre_materia || '').toLowerCase().includes(busqueda);
          if (filtroEstado === 'CRITICO') return cumpleTexto && Number(i.cantidad_disponible) < 300;
          if (filtroEstado === 'ESTABLE') return cumpleTexto && Number(i.cantidad_disponible) >= 300;
          return cumpleTexto;
        });

      case 'productos':
        return catalogoProductos.filter((p) => (p.nombre || '').toLowerCase().includes(busqueda));

      case 'usuarios':
        return usuarios.filter((u) => {
          const cumpleTexto = (u.nombre || '').toLowerCase().includes(busqueda) || (u.correo || '').toLowerCase().includes(busqueda);
          const cumpleSelect = filtroEstado === 'TODOS' || (u.rol || 'operador').toLowerCase() === filtroEstado.toLowerCase();
          return cumpleTexto && cumpleSelect;
        });

      default:
        return [];
    }
  };

  const datos = obtenerDatosFiltrados();

  return (
    <div>
      <button onClick={onVolver} className="text-xs text-blue-400 font-bold mb-4 hover:underline">
        ← Volver al panel principal
      </button>

      <section className="bg-[#131a2e] border border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">{TITULOS[pantallaActiva] || pantallaActiva}</h2>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Buscar..."
              value={filtroTexto}
              onChange={(e) => onFiltroTexto(e.target.value)}
              className="bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
            />

            {pantallaActiva === 'lotes' && (
              <select value={filtroEstado} onChange={(e) => onFiltroEstado(e.target.value)} className="bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs">
                <option value="TODOS">Todos</option>
                <option value="OPTIMOS">✅ Óptimos (0 rechazos)</option>
                <option value="RECHAZADOS">⚠️ Con rechazos</option>
              </select>
            )}
            {pantallaActiva === 'bolsas' && (
              <select value={filtroEstado} onChange={(e) => onFiltroEstado(e.target.value)} className="bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs">
                <option value="TODOS">Todos</option>
                <option value="ACEPTADO">Aceptados</option>
                <option value="RECHAZADO">Rechazados</option>
              </select>
            )}
            {pantallaActiva === 'ordenes' && (
              <select value={filtroEstado} onChange={(e) => onFiltroEstado(e.target.value)} className="bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs">
                <option value="TODOS">Todos</option>
                <option value="en_proceso">En proceso</option>
                <option value="pausado">Pausados</option>
                <option value="completado">Completados</option>
              </select>
            )}
            {pantallaActiva === 'inventario' && (
              <select value={filtroEstado} onChange={(e) => onFiltroEstado(e.target.value)} className="bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs">
                <option value="TODOS">Todos</option>
                <option value="CRITICO">🔴 Stock crítico (&lt; 300)</option>
                <option value="ESTABLE">🟢 Stock estable</option>
              </select>
            )}
            {pantallaActiva === 'usuarios' && (
              <select value={filtroEstado} onChange={(e) => onFiltroEstado(e.target.value)} className="bg-[#0b0f19] border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 text-xs">
                <option value="TODOS">Todos</option>
                <option value="administrador">Administradores</option>
                <option value="supervisor">Supervisores</option>
                <option value="operador">Operadores</option>
              </select>
            )}
          </div>

          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
            Filtrados: <span className="text-white font-mono">{datos.length}</span> registros
          </span>
        </div>

        <div className="overflow-x-auto">
          {cargando ? (
            <div className="p-10 text-center text-xs font-bold text-slate-500 tracking-widest animate-pulse uppercase">Consultando base de datos completa...</div>
          ) : datos.length === 0 ? (
            <div className="p-10 text-center text-xs font-bold text-slate-500 tracking-widest uppercase">No existen registros que coincidan con este filtro</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0e1424] text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                  {pantallaActiva === 'lotes' && (
                    <>
                      <th className="p-3">Nº Lote</th>
                      <th className="p-3">Aceptados</th>
                      <th className="p-3">Rechazados</th>
                      <th className="p-3">Fecha Producción</th>
                      <th className="p-3">Observaciones</th>
                    </>
                  )}
                  {pantallaActiva === 'bolsas' && (
                    <>
                      <th className="p-3">Lote Asociado</th>
                      <th className="p-3">Peso Real (g)</th>
                      <th className="p-3">Objetivo (g)</th>
                      <th className="p-3">Estado Control</th>
                      <th className="p-3">Marca Temporal</th>
                    </>
                  )}
                  {pantallaActiva === 'ordenes' && (
                    <>
                      <th className="p-3">ID Orden</th>
                      <th className="p-3">Tamaño Lote</th>
                      <th className="p-3">Cantidad Solicitada</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Creación</th>
                    </>
                  )}
                  {pantallaActiva === 'inventario' && (
                    <>
                      <th className="p-3">ID Materia</th>
                      <th className="p-3">Materia Prima</th>
                      <th className="p-3">Cantidad Disponible</th>
                      <th className="p-3">Última Actualización</th>
                    </>
                  )}
                  {pantallaActiva === 'productos' && (
                    <>
                      <th className="p-3">ID Producto</th>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Peso Presentación</th>
                      <th className="p-3">Descripción</th>
                    </>
                  )}
                  {pantallaActiva === 'usuarios' && (
                    <>
                      <th className="p-3">ID</th>
                      <th className="p-3">Nombre Completo</th>
                      <th className="p-3">Correo Electrónico</th>
                      <th className="p-3">Rol Técnico</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {datos.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-800/60 hover:bg-[#161f36] transition-colors text-slate-300">
                    {pantallaActiva === 'lotes' && (
                      <>
                        <td className="p-3 font-mono font-bold text-blue-400">{item.numero_lote}</td>
                        <td className="p-3 text-emerald-400 font-bold">{item.cantidad_producida} ud</td>
                        <td className="p-3 text-red-400 font-bold">{item.cantidad_rechazada} ud</td>
                        <td className="p-3">{item.fecha_produccion}</td>
                        <td className="p-3 italic text-slate-400">{item.observaciones}</td>
                      </>
                    )}
                    {pantallaActiva === 'bolsas' && (
                      <>
                        <td className="p-3 font-mono font-bold text-slate-400">{item.id_lote}</td>
                        <td className={`p-3 font-bold ${item.estado_llenado === 'ACEPTADO' ? 'text-blue-400' : 'text-red-400'}`}>{item.peso_real} g</td>
                        <td className="p-3 text-slate-400">{item.peso_objetivo} g</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.estado_llenado === 'ACEPTADO' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                            {item.estado_llenado}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono">{item.fecha_hora}</td>
                      </>
                    )}
                    {pantallaActiva === 'ordenes' && (
                      <>
                        <td className="p-3 font-bold text-slate-400"># {item.id_orden}</td>
                        <td className="p-3 font-bold text-white">{item.tamano_lote}</td>
                        <td className="p-3">{item.cantidad_solicitada}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              item.estado === 'completado'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : item.estado === 'pausado'
                                ? 'bg-slate-500/20 text-slate-300'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {item.estado}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{item.fecha_creacion}</td>
                      </>
                    )}
                    {pantallaActiva === 'inventario' && (
                      <>
                        <td className="p-3 font-mono">MAT-{item.id_materia}</td>
                        <td className="p-3 font-bold text-white">{item.nombre_materia}</td>
                        <td className={`p-3 font-bold ${Number(item.cantidad_disponible) < 300 ? 'text-red-400' : 'text-amber-400'}`}>
                          {item.cantidad_disponible} {item.unidad_medida}
                        </td>
                        <td className="p-3 text-slate-400">{item.ultima_actualizacion}</td>
                      </>
                    )}
                    {pantallaActiva === 'productos' && (
                      <>
                        <td className="p-3 font-mono">PROD-{item.id_producto}</td>
                        <td className="p-3 font-bold text-white">{item.nombre}</td>
                        <td className="p-3 text-cyan-400 font-bold">{item.peso_presentacion} g</td>
                        <td className="p-3 text-slate-400">{item.descripcion || 'Sin descripción'}</td>
                      </>
                    )}
                    {pantallaActiva === 'usuarios' && (
                      <>
                        <td className="p-3"># {item.id_usuario}</td>
                        <td className="p-3 font-bold text-white">{item.nombre}</td>
                        <td className="p-3 text-slate-400">{item.correo}</td>
                        <td className="p-3 uppercase font-extrabold text-blue-400 text-[10px] tracking-wider">{item.rol || 'operador'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
