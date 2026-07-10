// ==========================================
// Estados de una Orden de Producción
// ==========================================

export type EstadoOrden =
  | "pendiente"
  | "en_proceso"
  | "finalizada"
  | "cancelada";

// ==========================================
// Estados del llenado
// ==========================================

export type EstadoLlenado =
  | "aceptado"
  | "rechazado";