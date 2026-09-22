"use client";
import { useState } from "react";

export default function PedirClave({ params }: { params: { token: string } }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setCargando(true);
    try {
      const r = await fetch("/api/clave", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, clave }),
      });
      if (r.ok) window.location.href = `/v/${params.token}`;
      else setError((await r.json().catch(() => ({}))).error || "No fue posible entrar.");
    } catch {
      setError("Error de conexión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="centro">
      <p className="etiqueta">Grupo SYS</p>
      <h1>Contenido protegido</h1>
      <p className="bajada" style={{ margin: "0 auto 22px" }}>
        Escriba la clave que recibió junto con este enlace.
      </p>
      <form onSubmit={entrar}>
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Clave"
          autoFocus
          style={{ maxWidth: 260, margin: "0 auto", textAlign: "center", letterSpacing: 2 }}
        />
        <p>
          <button type="submit" disabled={cargando} style={{ padding: "10px 22px" }}>
            {cargando ? "Comprobando…" : "Entrar"}
          </button>
        </p>
      </form>
      {error && <p style={{ color: "var(--alta)" }}>{error}</p>}
      <p style={{ marginTop: 26, fontSize: 12.5, color: "var(--txt-soft)" }}>
        Si no la tiene, solicítela a su contacto en Grupo SYS.
      </p>
    </main>
  );
}
