'use client';

type Props = {
  lotesConcluidos: any[];
  historicoBolsas: any[];
  ordenesProduccion: any[];
  inventario: any[];
  catalogoProductos: any[];
  usuarios: any[];
  onCambiarPantalla: (pantalla: string) => void;
};

export default function MenuNavegacion({
  lotesConcluidos,
  historicoBolsas,
  ordenesProduccion,
  inventario,
  catalogoProductos,
  usuarios,
  onCambiarPantalla,
}: Props) {
  const opciones = [
    { id: 'lotes', icono: '📦', titulo: 'Lotes Concluidos', total: lotesConcluidos.length },
    { id: 'bolsas', icono: '🧾', titulo: 'Bolsas Registradas', total: historicoBolsas.length },
    { id: 'ordenes', icono: '📋', titulo: 'Órdenes de Producción', total: ordenesProduccion.length },
    { id: 'inventario', icono: '🧱', titulo: 'Inventario Materias', total: inventario.length },
    { id: 'productos', icono: '🏷️', titulo: 'Catálogo Productos', total: catalogoProductos.length },
    { id: 'usuarios', icono: '👥', titulo: 'Usuarios', total: usuarios.length },
  ];

  return (
    <>
      <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3">📂 Consultar Bases de Datos de la Planta</h3>
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {opciones.map((op) => (
          <button
            key={op.id}
            onClick={() => onCambiarPantalla(op.id)}
            className="p-4 bg-[#131a2e] border border-slate-800 hover:border-blue-500 rounded-xl text-center transition-all group shadow-md"
          >
            <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{op.icono}</div>
            <p className="text-xs font-bold text-white">{op.titulo}</p>
            <span className="text-[10px] text-blue-400 font-mono font-bold">{op.total} Registros</span>
          </button>
        ))}
      </section>
    </>
  );
}
