import { NextResponse } from "next/server";
import { claveCorrecta, nombreCookieClave } from "@/lib/accesos";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { token, clave } = await req.json().catch(() => ({} as any));
  if (!token || !clave) {
    return NextResponse.json({ error: "Escribe la clave." }, { status: 400 });
  }
  const firma = await claveCorrecta(String(token), String(clave));
  if (!firma) {
    return NextResponse.json({ error: "La clave no es correcta." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(nombreCookieClave(String(token)), firma, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12,
  });
  return res;
}
