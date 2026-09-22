import { NextRequest, NextResponse } from "next/server";

// Permitir por defecto NADA. Solo las rutas de esta lista existen; cualquier
// otra cosa se manda a la pantalla de acceso no válido sin tocar Firestore.
const PUBLICAS = ["/", "/expirado", "/admin", "/api/admin-login", "/api/accesos"];
const TOKEN = /^\/v\/[A-Za-z0-9_-]{16,80}(\/|$)/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") return NextResponse.next();
  if (PUBLICAS.includes(pathname) || TOKEN.test(pathname)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/expirado";
  url.search = "e=inexistente";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
