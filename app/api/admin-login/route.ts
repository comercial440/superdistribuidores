import { NextResponse } from "next/server";
import { COOKIE_ADMIN } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const esperada = process.env.SD_ADMIN_PASSWORD;
  const token = process.env.SD_ADMIN_TOKEN;
  if (!esperada || !token) {
    return NextResponse.json({ error: "Administración no configurada." }, { status: 500 });
  }
  if (password !== esperada) {
    return NextResponse.json({ error: "Clave incorrecta." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_ADMIN, token, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_ADMIN, "", { path: "/", maxAge: 0 });
  return res;
}
