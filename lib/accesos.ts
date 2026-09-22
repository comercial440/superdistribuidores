// Accesos por cliente. Un acceso = un enlace con token propio, con vigencia y
// alcance (zonas y cultivos visibles). Revocarlo es poner `activo: false` en
// Firestore: surte efecto en la siguiente petición, sin volver a desplegar.
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebaseAdmin";

export const COLECCION = "sd_accesos";
export const DIAS_POR_DEFECTO = 8;

export interface Acceso {
  token: string;
  codigoCorto: string;
  clienteId: string;        // interno; nunca se muestra en la página
  titulo: string;           // lo que ve el destinatario
  destinatario: string;     // solo para el pie de página
  zonas: string[];
  cultivos: string[];       // ids de lib/tecnico/fenologia.json; [] = todos
  secciones: string[];      // portafolio | competencia | cultivos
  creado: string;
  expira: string;           // ISO
  activo: boolean;
  notaRevocacion?: string;
  ultimoAcceso?: string;
  vistas?: number;
}

export type Estado = "ok" | "expirado" | "revocado" | "inexistente";

/** Formato del token: no toca la red si el token no tiene la forma esperada. */
export function formatoValido(token: string): boolean {
  return /^[A-Za-z0-9_-]{16,80}$/.test(token || "");
}

function vencido(a: Acceso): boolean {
  const t = Date.parse(a.expira);
  return !Number.isFinite(t) || t < Date.now();
}

/**
 * Busca el acceso por token o por código corto. `cache` evita releer Firestore
 * varias veces dentro de la misma petición.
 */
export const buscarAcceso = cache(async (
  clave: string
): Promise<{ estado: Estado; acceso: Acceso | null }> => {
  if (!formatoValido(clave)) return { estado: "inexistente", acceso: null };
  let snap;
  try {
    const db = adminDb();
    snap = await db.collection(COLECCION).where("token", "==", clave).limit(1).get();
    if (snap.empty) {
      snap = await db.collection(COLECCION)
        .where("codigoCorto", "==", clave.toUpperCase()).limit(1).get();
    }
  } catch {
    // Si no se puede comprobar la vigencia, no se muestra nada.
    return { estado: "inexistente", acceso: null };
  }
  if (snap.empty) return { estado: "inexistente", acceso: null };
  const acceso = snap.docs[0].data() as Acceso;
  if (!acceso.activo) return { estado: "revocado", acceso };
  if (vencido(acceso)) return { estado: "expirado", acceso };
  return { estado: "ok", acceso };
});

/**
 * Acceso válido o nada. Cualquier estado distinto de `ok` sale por /expirado,
 * sin renderizar contenido ni distinguir entre vencido, revocado e inexistente
 * más allá del mensaje.
 */
export async function exigirAcceso(clave: string): Promise<Acceso> {
  const { estado, acceso } = await buscarAcceso(clave);
  if (estado !== "ok" || !acceso) redirect(`/expirado?e=${estado}`);
  return acceso;
}

/** Días que faltan para que venza (0 si vence hoy). */
export function diasRestantes(a: Acceso): number {
  const ms = Date.parse(a.expira) - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export function puedeVer(a: Acceso, seccion: string): boolean {
  return !a.secciones?.length || a.secciones.includes(seccion);
}

/** Registra la visita. Nunca hace fallar la página. */
export async function marcarVisita(a: Acceso): Promise<void> {
  try {
    const db = adminDb();
    const q = await db.collection(COLECCION).where("token", "==", a.token).limit(1).get();
    if (!q.empty) {
      await q.docs[0].ref.update({
        ultimoAcceso: new Date().toISOString(),
        vistas: (a.vistas ?? 0) + 1,
      });
    }
  } catch { /* la trazabilidad no puede tumbar la vista del cliente */ }
}
