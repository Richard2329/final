import { supabase } from '@/lib/supabaseClient';

/**
 * Devuelve todo el inventario de materias primas.
 */
export async function consultarInventario() {
  const { data, error } = await supabase.from('inventario_materias').select('*');
  if (error) {
    console.error('❌ Error consultando inventario:', error.message);
    throw error;
  }
  return data || [];
}

/**
 * Descuenta stock de una materia prima cuando se acepta una bolsa.
 *
 * OJO: la columna real en Supabase es "nombre_materia", no "nombre".
 * Antes esto fallaba silenciosamente porque .ilike('nombre', ...) nunca
 * encontraba coincidencias y el inventario nunca se actualizaba.
 */
export async function descontarStock(
  nombreProducto: string,
  pesoObjetivoGramos: number,
  fecha: string
) {

  const { data: materia, error: errBusqueda } = await supabase
    .from("inventario_materias")
    .select("*")
    .ilike("nombre_materia", nombreProducto)
    .maybeSingle();

  if (errBusqueda) {
    console.error("❌ Error buscando materia prima:", errBusqueda.message);
    return null;
  }

  if (!materia) {
    console.warn(`⚠️ No existe la materia prima ${nombreProducto}`);
    return null;
  }

  const consumo = pesoObjetivoGramos / 1000;

  if (parseFloat(materia.cantidad_disponible) < consumo) {
    console.error("❌ Stock insuficiente.");
    return null;
  }

  const nuevoStock = parseFloat(materia.cantidad_disponible) - consumo;

  const { error: errUpdate } = await supabase
    .from("inventario_materias")
    .update({
      cantidad_disponible: Number(nuevoStock.toFixed(3)),
      ultima_actualizacion: fecha,
    })
    .eq("id_materia", materia.id_materia);

  if (errUpdate) {
    console.error("❌ Error actualizando stock:", errUpdate.message);
    return null;
  }

  console.log(
    `📦 Inventario actualizado | ${nombreProducto}: ${materia.cantidad_disponible} kg → ${nuevoStock.toFixed(3)} kg`
  );

  return nuevoStock;
}
