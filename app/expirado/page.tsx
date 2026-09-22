export const dynamic = "force-dynamic";

const MENSAJES: Record<string, { t: string; d: string }> = {
  expirado: {
    t: "El enlace venció",
    d: "Este enlace tenía una vigencia definida y ya se cumplió. Su contacto en Grupo SYS puede emitir uno nuevo.",
  },
  revocado: {
    t: "El enlace fue desactivado",
    d: "Este enlace ya no está habilitado. Su contacto en Grupo SYS puede emitir uno nuevo.",
  },
  inexistente: {
    t: "El enlace no es válido",
    d: "No reconocemos este enlace. Verifique que lo copió completo, tal como se lo enviaron.",
  },
};

export default function Expirado({ searchParams }: { searchParams: { e?: string } }) {
  const m = MENSAJES[searchParams?.e ?? ""] ?? MENSAJES.inexistente;
  return (
    <main className="centro">
      <p className="etiqueta">Acceso</p>
      <h1>{m.t}</h1>
      <p className="bajada" style={{ margin: "0 auto" }}>{m.d}</p>
      <p className="pie" style={{ marginTop: 28, borderTop: "none" }}>
        Grupo SYS · Science Yields Solutions
      </p>
    </main>
  );
}
