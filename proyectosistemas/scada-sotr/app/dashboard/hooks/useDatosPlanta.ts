import { useCallback, useEffect, useState } from 'react';
import { crearClienteNavegador } from '@/lib/supabase/client';

export function useDatosPlanta() {
  const supabase = crearClienteNavegador();

  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [lotesConcluidos, setLotesConcluidos] = useState<any[]>([]);
  const [ordenesProduccion, setOrdenesProduccion] = useState<any[]>([]);
  const [catalogoProductos, setCatalogoProductos] = useState<any[]>([]);
  const [historicoBolsas, setHistoricoBolsas] = useState<any[]>([]);
  const [alarmas, setAlarmas] = useState<any[]>([]);

  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [productosActivos, setProductosActivos] = useState(0);
  const [ordenesProcesadas, setOrdenesProcesadas] = useState(0);
  const [materiaPrimaCount, setMateriaPrimaCount] = useState(0);
  const [aceptados, setAceptados] = useState(0);
  const [rechazados, setRechazados] = useState(0);
  const [eficienciaOEE, setEficienciaOEE] = useState(0);
  const [registroMermas, setRegistroMermas] = useState(0);
  const [estadoCelda, setEstadoCelda] = useState('CONCLUIDO');
  const [ultimoLoteId, setUltimoLoteId] = useState('N/A');

  const [cargando, setCargando] = useState(true);

  const refrescar = useCallback(async () => {
    try {
      setCargando(true);

      const { data: dataUsuarios } = await supabase.from('usuarios').select('*');
      setUsuarios(dataUsuarios || []);
      setTotalUsuarios((dataUsuarios || []).length);

      const { data: dataProd } = await supabase.from('productos').select('*');
      setCatalogoProductos(dataProd || []);
      setProductosActivos((dataProd || []).length);

      const { data: dataOrd } = await supabase
        .from('ordenes_produccion')
        .select('*')
        .order('fecha_creacion', { ascending: false });
      setOrdenesProduccion(dataOrd || []);
      setOrdenesProcesadas((dataOrd || []).length);

      const { data: dataMat } = await supabase.from('inventario_materias').select('*');
      setInventario(dataMat || []);
      setMateriaPrimaCount((dataMat || []).length);

      const { data: dataLotes } = await supabase
        .from('lotes')
        .select('*')
        .order('fecha_produccion', { ascending: false });
      setLotesConcluidos(dataLotes || []);

      const { data: dataBolsas } = await supabase
        .from('produccion_historica')
        .select('*')
        .order('fecha_hora', { ascending: false });
      setHistoricoBolsas(dataBolsas || []);

      // --- Métricas derivadas de lotes ---
      if (dataLotes && dataLotes.length > 0) {
        setUltimoLoteId(dataLotes[0].numero_lote);
        let sumaAceptados = 0;
        let sumaRechazados = 0;
        dataLotes.forEach((l) => {
          sumaAceptados += Number(l.cantidad_producida || 0);
          sumaRechazados += Number(l.cantidad_rechazada || 0);
        });
        setAceptados(sumaAceptados);
        setRechazados(sumaRechazados);

        const totalUnidades = sumaAceptados + sumaRechazados;
        if (totalUnidades > 0) {
          setEficienciaOEE(Math.round((sumaAceptados / totalUnidades) * 100));
        }
      }

      // --- Alarmas en tiempo real a partir del histórico de bolsas ---
      if (dataBolsas && dataBolsas.length > 0) {
        let desvioNetoTotal = 0;
        const nuevasAlarmas: any[] = [];

        dataBolsas.forEach((b) => {
          const desvio = Math.abs(Number(b.peso_real || 0) - Number(b.peso_objetivo || 0));
          desvioNetoTotal += desvio;

          if (b.estado_llenado === 'RECHAZADO') {
            nuevasAlarmas.push({
              id: b.id_registro || Math.random(),
              fecha: b.fecha_hora,
              mensaje: `Desviación crítica detectada en lote ${b.id_lote}: Peso de ${b.peso_real}g fuera de rango.`,
            });
          }
        });

        setAlarmas(nuevasAlarmas.slice(0, 5));
        setRegistroMermas(parseFloat(desvioNetoTotal.toFixed(2)));
        setEstadoCelda(dataBolsas[0].estado_llenado === 'ACEPTADO' ? 'PROCESANDO' : 'CRÍTICO / RECHAZO');
      }
    } catch (error) {
      console.error('❌ Error general cargando datos SCADA:', error);
    } finally {
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refrescar();
    fetch('/api/inventario/mqtt').catch((err) => console.log('Pasarela MQTT inicializada', err));

    const canal = supabase
      .channel('scada-cambios')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        refrescar();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    usuarios,
    inventario,
    lotesConcluidos,
    ordenesProduccion,
    catalogoProductos,
    historicoBolsas,
    alarmas,
    totalUsuarios,
    productosActivos,
    ordenesProcesadas,
    materiaPrimaCount,
    aceptados,
    rechazados,
    eficienciaOEE,
    registroMermas,
    estadoCelda,
    ultimoLoteId,
    cargando,
    refrescar,
  };
}
