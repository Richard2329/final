import type { SupabaseClient } from '@supabase/supabase-js';

export type PerfilUsuario = {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: string;
};

/**
 * Inicia sesión con Supabase Auth (email + contraseña).
 */
export async function iniciarSesion(supabase: SupabaseClient, correo: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: data.user };
}

/**
 * Cierra la sesión activa.
 */
export async function cerrarSesion(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut();
  return { ok: !error, error: error?.message };
}

/**
 * Busca el perfil de negocio (nombre, rol) en la tabla "usuarios" a partir
 * del correo autenticado en Supabase Auth.
 *
 * NOTA: esto asume que el correo en auth.users coincide con el correo en
 * tu tabla "usuarios". Si más adelante agregas una columna auth_user_id
 * (uuid) en "usuarios", es más robusto buscar por id en vez de por correo.
 */
export async function obtenerPerfilPorCorreo(supabase: SupabaseClient, correo: string): Promise<PerfilUsuario | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, correo, rol')
    .ilike('correo', correo)
    .maybeSingle();

  if (error) {
    console.error('❌ Error obteniendo perfil de usuario:', error.message);
    return null;
  }

  if (!data) {
    console.warn(`⚠️ No existe registro en "usuarios" para el correo ${correo}. El usuario se autenticó pero no tiene perfil/rol asignado.`);
    return null;
  }

  return data as PerfilUsuario;
}
