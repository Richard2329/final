'use client';

import { useEffect, useState } from 'react';
import { crearClienteNavegador } from '@/lib/supabase/client';
import { obtenerPerfilPorCorreo, type PerfilUsuario } from '@/lib/services/auth';
import { useDatosPlanta } from './hooks/useDatosPlanta';

import EncabezadoHMI from './components/EncabezadoHMI';
import BannerAlarmas from './components/BannerAlarmas';
import PanelDespacho from './components/PanelDespacho';
import TarjetasMetricas from './components/TarjetasMetricas';
import MonitorSPC from './components/MonitorSPC';
import MenuNavegacion from './components/MenuNavegacion';
import TablaDatos from './components/TablaDatos';

export default function DashboardPage() {
  const supabase = crearClienteNavegador();

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [pantallaActiva, setPantallaActiva] = useState('principal');
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');

  const datos = useDatosPlanta();

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const perfilEncontrado = await obtenerPerfilPorCorreo(supabase, user.email);
        setPerfil(perfilEncontrado);
      }
    };
    cargarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cambiarPantalla = (pantalla: string) => {
    setPantallaActiva(pantalla);
    setFiltroTexto('');
    setFiltroEstado('TODOS');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 font-sans">
      <EncabezadoHMI perfil={perfil} onSincronizar={datos.refrescar} />

      {pantallaActiva === 'principal' ? (
        <>
          <BannerAlarmas alarmas={datos.alarmas} />

          <PanelDespacho
            catalogoProductos={datos.catalogoProductos}
            inventario={datos.inventario}
            perfil={perfil}
            onOrdenCreada={datos.refrescar}
          />

          <TarjetasMetricas
            estadoCelda={datos.estadoCelda}
            ultimoLoteId={datos.ultimoLoteId}
            eficienciaOEE={datos.eficienciaOEE}
            aceptados={datos.aceptados}
            rechazados={datos.rechazados}
            registroMermas={datos.registroMermas}
          />

          <MonitorSPC historicoBolsas={datos.historicoBolsas} />

          <MenuNavegacion
            lotesConcluidos={datos.lotesConcluidos}
            historicoBolsas={datos.historicoBolsas}
            ordenesProduccion={datos.ordenesProduccion}
            inventario={datos.inventario}
            catalogoProductos={datos.catalogoProductos}
            usuarios={datos.usuarios}
            onCambiarPantalla={cambiarPantalla}
          />
        </>
      ) : (
        <TablaDatos
          pantallaActiva={pantallaActiva}
          lotesConcluidos={datos.lotesConcluidos}
          historicoBolsas={datos.historicoBolsas}
          ordenesProduccion={datos.ordenesProduccion}
          inventario={datos.inventario}
          catalogoProductos={datos.catalogoProductos}
          usuarios={datos.usuarios}
          cargando={datos.cargando}
          filtroTexto={filtroTexto}
          filtroEstado={filtroEstado}
          onFiltroTexto={setFiltroTexto}
          onFiltroEstado={setFiltroEstado}
          onVolver={() => cambiarPantalla('principal')}
        />
      )}
    </div>
  );
}
