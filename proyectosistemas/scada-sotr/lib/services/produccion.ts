import { supabase } from '@/lib/supabaseClient';
import { descontarStock } from './inventario';
import { crearLote } from '@/lib/services/lotes';
import { enviarInicioProduccion } from "@/lib/mqtt";
/**
 * Transacción ABRIR_ORDEN: crea una nueva orden de producción.
 */
export async function iniciarOrden(datos: any) {
  const { data: prodData } = await supabase
    .from('productos')
    .select('id_producto')
    .ilike('nombre', datos.producto)
    .maybeSingle();

  const idProductoReal = prodData ? prodData.id_producto : 1;

  // Redondea el tamaño de lote al múltiplo de 10 más cercano (check constraint de la BD)
  let tamanoValidado = parseInt(datos.tamano_lote);
  if (isNaN(tamanoValidado) || tamanoValidado <= 0) {
    tamanoValidado = 10;
  } else {
    tamanoValidado = Math.round(tamanoValidado / 10) * 10;
    if (tamanoValidado === 0) tamanoValidado = 10;
  }

  const { data: ordenCreada, error } = await supabase
    .from('ordenes_produccion')
    .insert([{
    fecha_creacion: datos.fecha,
    id_producto: idProductoReal,
    tamano_lote: tamanoValidado,
    cantidad_solicitada: tamanoValidado,
    estado: 'en_proceso',
    id_operador: 1,
  }])
  .select()
  .single();
  if (error) {
    console.error('❌ Error crítico en ordenes_produccion:', error.message);
    return { ok: false, error: error.message };
  }
  const resultadoLote = await crearLote({
  id_orden: ordenCreada.id_orden,
  fecha_produccion: datos.fecha.substring(0, 10),
  fecha_caducidad: '2027-06-30'
});

if (!resultadoLote.ok) {
  return {
    ok: false,
    error: resultadoLote.mensaje
  };
}

console.log("🚀 VOY A ENVIAR MQTT:", resultadoLote.data.numero_lote);
await enviarInicioProduccion(resultadoLote.data.numero_lote); 
console.log(`✅ Orden de producción guardada con lote adaptado a: ${tamanoValidado}`);
  return { ok: true, tamanoValidado };
}

/**
 * Transacción REGISTRO_BOLSA: guarda el histórico de cada bolsa y,
 * si fue ACEPTADA, descuenta el stock correspondiente.
 */
export async function registrarBolsa(datos: any) {
 console.log("🔥 ENTRÓ A registrarBolsa", datos);
  // Buscar el ID del lote por su número
  const { data: lote, error: errLote } = await supabase
    .from('lotes')
    .select('id_lote')
    .eq('numero_lote', datos.lote)
    .single();

  if (errLote || !lote) {
    console.error("❌ Lote no encontrado:", datos.lote);
    return {
      ok: false,
      error: "Lote no encontrado"
    };
  }

  // Registrar la bolsa
  const { error: errHist } = await supabase
    .from('produccion_historica')
    .insert([{
      id_lote: lote.id_lote,
      peso_real: datos.peso_real,
      peso_objetivo: datos.peso_objetivo,
      estado_llenado: datos.estado.toLowerCase(),
      fecha_hora: datos.fecha,
    }]);
   
  if (errHist) {
    console.error("❌ Error en produccion_historica:", errHist.message);
    return {
      ok: false,
      error: errHist.message
    };
    
  }

  console.log(`✅ Bolsa registrada para el lote ${datos.lote}`);
 console.log("Estado recibido:", datos.estado);
  if (datos.estado.toLowerCase() === "aceptado") {
    await descontarStock(
      datos.producto,
      datos.peso_objetivo,
      datos.fecha
    );
    console.log("📦 Descontando inventario...");
  }

  return { ok: true };
}
/**
 * Transacción CERRAR_LOTE: cierra el lote, calcula secuencia si hay
 * lotes con el mismo prefijo, y marca la orden asociada como completada.
 */
export async function finalizarLote(datos: any) {
  const { data: orden } = await supabase
    .from('ordenes_produccion')
    .select('id_orden')
    .eq('estado', 'en_proceso')
    .order('fecha_creacion', { ascending: false })
    .limit(1)
    .maybeSingle();

  const idOrdenAsociada = orden ? orden.id_orden : null;

  console.log("📦 Finalizando lote:", datos.lote);
  console.log("📦 idOrdenAsociada:", idOrdenAsociada);
  const { error } = await supabase
.from('lotes')
.update({
    cantidad_producida: datos.aceptados,
    cantidad_rechazada: datos.rechazados,
    observaciones: 'Lote cerrado vía MQTT'
})
.eq('numero_lote', datos.lote);

  if (error) {
    console.error('❌ Error en tabla lotes:', error.message);
    return { ok: false, error: error.message };
  }

  console.log(`Lote finalizado: ${datos.lote}`);

  if (idOrdenAsociada) {
    await supabase.from('ordenes_produccion').update({ estado: 'completada' }).eq('id_orden', idOrdenAsociada);
  }

  return { ok: true };

  
}

/**
 * NUEVO: pausar una orden en curso (para el proceso "pausar" del HMI).
 */
export async function pausarOrdenActiva() {
  const { data: orden, error: errBuscar } = await supabase
    .from('ordenes_produccion')
    .select('id_orden')
    .eq('estado', 'en_proceso')
    .order('fecha_creacion', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errBuscar || !orden) {
    return { ok: false, error: 'No hay ninguna orden en proceso para pausar.' };
  }

  const { error } = await supabase
    .from('ordenes_produccion')
    .update({ estado: 'pausado' })
    .eq('id_orden', orden.id_orden);

  if (error) return { ok: false, error: error.message };
  return { ok: true, id_orden: orden.id_orden };
}

/**
 * NUEVO: reanudar una orden previamente pausada.
 */
export async function reanudarOrdenPausada() {
  const { data: orden, error: errBuscar } = await supabase
    .from('ordenes_produccion')
    .select('id_orden')
    .eq('estado', 'pausado')
    .order('fecha_creacion', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (errBuscar || !orden) {
    return { ok: false, error: 'No hay ninguna orden pausada para reanudar.' };
  }

  const { error } = await supabase
    .from('ordenes_produccion')
    .update({ estado: 'en_proceso' })
    .eq('id_orden', orden.id_orden);

  if (error) return { ok: false, error: error.message };
  return { ok: true, id_orden: orden.id_orden };
}
