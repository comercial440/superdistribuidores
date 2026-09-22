import "server-only";
import { cookies } from "next/headers";

export const COOKIE_ADMIN = "sd_admin";

/** Sesión de administración (solo María). Clave y token viven en Vercel. */
export function esAdmin(): boolean {
  const esperado = process.env.SD_ADMIN_TOKEN;
  if (!esperado) return false;
  return cookies().get(COOKIE_ADMIN)?.value === esperado;
}
