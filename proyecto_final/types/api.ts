// ======================================================
// SISTEMA AUTOMATIZADO DE PRODUCCIÓN
// Respuesta estándar de todos los servicios
// ======================================================

export interface ApiResponse<T = any> {
  ok: boolean;
  mensaje: string;
  data?: T;
}