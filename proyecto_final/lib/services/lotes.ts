// ======================================================
// SISTEMA AUTOMATIZADO DE PRODUCCIÓN
// Módulo: Lotes
// Responsable:
// - Generar número de lote
// - Crear lote
// - Obtener lote por orden
// ======================================================

import { supabase } from "../supabaseClient";
import { ApiResponse } from "@/types/api";

// ======================================================
// DTO
// ======================================================

export interface CrearLoteDTO {
    id_orden: number;
    fecha_produccion: string;
    fecha_caducidad: string;
}

// ======================================================
// FUNCIONES PRIVADAS
// ======================================================

/**
 * Devuelve la fecha actual en formato AAAAMMDD
 */
function obtenerFechaActual(): string {

    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}${mes}${dia}`;

}

/**
 * Formatea el consecutivo del lote
 */
function formatearConsecutivo(numero: number): string {

    return numero.toString().padStart(4, "0");

}

// ======================================================
// GENERAR NUMERO DE LOTE
// ======================================================

export async function generarNumeroLote(): Promise<ApiResponse<string>> {

    const fecha = obtenerFechaActual();

    const { data, error } = await supabase
        .from("lotes")
        .select("numero_lote")
        .like("numero_lote", `LOT-${fecha}-%`)
        .order("numero_lote", { ascending: false })
        .limit(1);

    if (error) {

        return {
            ok: false,
            mensaje: error.message
        };

    }

    let consecutivo = 1;

    if (data.length > 0) {

        const ultimo = data[0].numero_lote;

        const partes = ultimo.split("-");

        consecutivo = Number(partes[2]) + 1;

    }

    const numeroLote = `LOT-${fecha}-${formatearConsecutivo(consecutivo)}`;

    return {

        ok: true,
        mensaje: "Número de lote generado correctamente.",
        data: numeroLote

    };

}

// ======================================================
// CREAR LOTE
// ======================================================

export async function crearLote(
    datos: CrearLoteDTO
): Promise<ApiResponse<any>> {

    // Generar número de lote

    const loteGenerado = await generarNumeroLote();

    if (!loteGenerado.ok || !loteGenerado.data) {

        return {

            ok: false,
            mensaje: loteGenerado.mensaje

        };

    }

    const { data, error } = await supabase

        .from("lotes")

        .insert({

            numero_lote: loteGenerado.data,

            id_orden: datos.id_orden,

            fecha_produccion: datos.fecha_produccion,

            fecha_caducidad: datos.fecha_caducidad,

            cantidad_producida: 0,

            cantidad_rechazada: 0,

            observaciones: null

        })

        .select()

        .single();

    if (error) {

        return {

            ok: false,
            mensaje: error.message

        };

    }

    return {

        ok: true,

        mensaje: "Lote creado correctamente.",

        data

    };

}

// ======================================================
// OBTENER LOTE POR ORDEN
// ======================================================

export async function obtenerLotePorOrden(
    idOrden: number
): Promise<ApiResponse<any>> {

    const { data, error } = await supabase

        .from("lotes")

        .select("*")

        .eq("id_orden", idOrden)

        .single();

    if (error) {

        return {

            ok: false,

            mensaje: error.message

        };

    }

    return {

        ok: true,

        mensaje: "Lote encontrado.",

        data

    };

}