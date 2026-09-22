import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { esAdmin } from "@/lib/adminAuth";
import { COLECCION, DIAS_POR_DEFECTO, type Acceso } from "@/lib/accesos";

export const dynamic = "force-dynamic";

const noAutorizado = () => NextResponse.json({ error: "No autorizado" }, { status: 401 });

export async function GET() {
  if (!esAdmin()) return noAutorizado();
  const snap = await adminDb().collection(COLECCION).orderBy("creado", "desc").limit(200).get();
  return NextResponse.json({ accesos: snap.docs.map((d) => d.data()) });
}

function codigoCorto(clienteId: string): string {
  const pre = (clienteId || "SD").replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3) || "SD";
  return `${pre}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function POST(req: Request) {
  if (!esAdmin()) return noAutorizado();
  const b = await req.json().catch(() => ({} as any));
  if (!b.clienteId || !b.destinatario) {
    return NextResponse.json({ error: "Faltan clienteId y destinatario." }, { status: 400 });
  }
  const dias = Number(b.dias) > 0 ? Number(b.dias) : DIAS_POR_DEFECTO;
  const expira = new Date();
  expira.setDate(expira.getDate() + dias);
  expira.setHours(23, 59, 59, 0);

  const acceso: Acceso = {
    token: randomBytes(24).toString("base64url"),
    codigoCorto: codigoCorto(b.clienteId),
    clienteId: String(b.clienteId),
    titulo: b.titulo || "Superdistribuidores",
    destinatario: String(b.destinatario),
    zonas: Array.isArray(b.zonas) ? b.zonas : [],
    cultivos: Array.isArray(b.cultivos) ? b.cultivos : [],
    secciones: Array.isArray(b.secciones) && b.secciones.length
      ? b.secciones : ["portafolio", "competencia", "cultivos"],
    creado: new Date().toISOString(),
    expira: expira.toISOString(),
    activo: true,
    vistas: 0,
    clave: typeof b.clave === "string" ? b.clave.trim() : "",
  };
  await adminDb().collection(COLECCION).doc(acceso.token).set(acceso);
  return NextResponse.json({ acceso });
}

/** Revocar, reactivar o cambiar la vigencia. Efecto inmediato, sin desplegar. */
export async function PATCH(req: Request) {
  if (!esAdmin()) return noAutorizado();
  const { token, activo, nota, expira } = await req.json().catch(() => ({} as any));
  if (!token) return NextResponse.json({ error: "Falta el token." }, { status: 400 });
  const ref = adminDb().collection(COLECCION).doc(token);
  if (!(await ref.get()).exists) {
    return NextResponse.json({ error: "Ese acceso no existe." }, { status: 404 });
  }
  const cambios: Record<string, unknown> = {};
  if (typeof activo === "boolean") cambios.activo = activo;
  if (typeof nota === "string") cambios.notaRevocacion = nota;
  if (typeof expira === "string" && !Number.isNaN(Date.parse(expira))) cambios.expira = expira;
  if (!Object.keys(cambios).length) {
    return NextResponse.json({ error: "Nada que cambiar." }, { status: 400 });
  }
  await ref.update(cambios);
  return NextResponse.json({ ok: true });
}
