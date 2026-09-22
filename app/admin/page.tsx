"use client";
import { useEffect, useState } from "react";

interface Acceso {
  token: string; codigoCorto: string; clienteId: string; titulo: string;
  destinatario: string; expira: string; activo: boolean; creado: string;
  vistas?: number; ultimoAcceso?: string; cultivos: string[]; clave?: string;
}

const fecha = (s?: string) =>
  s ? new Date(s).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function Admin() {
  const [entrado, setEntrado] = useState(false);
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [accesos, setAccesos] = useState<Acceso[]>([]);
  const [form, setForm] = useState({ clienteId: "", destinatario: "", titulo: "Distribuidores Aliados SYS", dias: 8, cultivos: "", clave: "" });
  const [nuevo, setNuevo] = useState<string>("");
  const [copiado, setCopiado] = useState<string>("");

  function enlaceDe(a: Acceso) {
    return `${location.origin}/v/${a.token}`;
  }

  async function copiar(a: Acceso) {
    const url = enlaceDe(a);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Si el navegador bloquea el portapapeles, al menos que lo vea para copiarlo a mano
      prompt("Copia el enlace:", url);
    }
    setCopiado(a.token);
    setTimeout(() => setCopiado(""), 2500);
  }

  async function cargar() {
    const r = await fetch("/api/accesos");
    if (r.ok) { setAccesos((await r.json()).accesos || []); setEntrado(true); }
  }
  useEffect(() => { cargar().catch(() => {}); }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const r = await fetch("/api/admin-login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: clave }),
    });
    if (r.ok) { setClave(""); cargar(); }
    else setError((await r.json().catch(() => ({}))).error || "No fue posible entrar.");
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault(); setError(""); setNuevo("");
    const r = await fetch("/api/accesos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form, dias: Number(form.dias),
        cultivos: form.cultivos.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setNuevo(`${location.origin}/v/${d.acceso.token}`);
      setForm({ ...form, clienteId: "", destinatario: "", clave: "" });
      cargar();
    } else setError(d.error || "No fue posible crear el acceso.");
  }

  async function revocar(a: Acceso) {
    if (!confirm(`¿Desactivar el enlace de ${a.destinatario}? Deja de funcionar de inmediato.`)) return;
    await fetch("/api/accesos", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: a.token, activo: !a.activo }),
    });
    cargar();
  }

  if (!entrado) {
    return (
      <main className="centro">
        <h1>Administración</h1>
        <form onSubmit={entrar}>
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)}
            placeholder="Clave" style={{ padding: 10, width: "100%", maxWidth: 300 }} />
          <p><button type="submit" style={{ padding: "9px 18px" }}>Entrar</button></p>
        </form>
        {error && <p style={{ color: "var(--alerta)" }}>{error}</p>}
      </main>
    );
  }

  return (
    <main className="wrap">
      <h1>Accesos por cliente</h1>
      <p className="bajada">
        Cada enlace es propio del cliente, con su vigencia y su alcance. Desactivarlo surte
        efecto de inmediato, sin volver a publicar la aplicación.
      </p>

      <section className="card">
        <h2 style={{ marginTop: 0 }}>Emitir un enlace</h2>
        <form onSubmit={crear} style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
          <label>Identificador interno
            <input value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
              placeholder="p. ej. distribuidor-01" required style={{ width: "100%", padding: 8 }} />
          </label>
          <label>Destinatario (va en el pie)
            <input value={form.destinatario} onChange={(e) => setForm({ ...form, destinatario: e.target.value })}
              required style={{ width: "100%", padding: 8 }} />
          </label>
          <label>Título visible
            <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              style={{ width: "100%", padding: 8 }} />
          </label>
          <label>Vigencia (días)
            <input type="number" min={1} max={120} value={form.dias}
              onChange={(e) => setForm({ ...form, dias: Number(e.target.value) })}
              style={{ width: "100%", padding: 8 }} />
          </label>
          <label>Clave para el cliente (opcional)
            <input value={form.clave} onChange={(e) => setForm({ ...form, clave: e.target.value })}
              placeholder="p. ej. SYS2027 · se entrega por otro canal"
              style={{ width: "100%", padding: 8 }} />
          </label>
          <label style={{ gridColumn: "1 / -1" }}>Cultivos visibles (ids separados por coma; vacío = todos)
            <input value={form.cultivos} onChange={(e) => setForm({ ...form, cultivos: e.target.value })}
              placeholder="cafe, aguacate-hass, tomate, platano, cacao, maiz, arroz"
              style={{ width: "100%", padding: 8 }} />
          </label>
          <p style={{ gridColumn: "1 / -1", margin: 0 }}>
            <button type="submit" style={{ padding: "9px 18px" }}>Emitir</button>
          </p>
        </form>
        {nuevo && (
          <div className="aviso" style={{ marginTop: 12 }}>
            <strong>Enlace emitido.</strong> Cópielo y entréguelo usted misma por el canal que
            corresponda:<br />
            <code style={{ wordBreak: "break-all" }}>{nuevo}</code>
          </div>
        )}
        {error && <p style={{ color: "var(--alerta)" }}>{error}</p>}
      </section>

      <div className="tabla-envoltura">
        <table>
          <thead>
            <tr><th>Destinatario</th><th>Enlace</th><th>Código</th><th>Vence</th><th>Estado</th><th>Vistas</th><th>Último acceso</th><th></th></tr>
          </thead>
          <tbody>
            {accesos.map((a) => {
              const vencido = Date.parse(a.expira) < Date.now();
              return (
                <tr key={a.token}>
                  <td><strong>{a.destinatario}</strong><br /><span style={{ color: "var(--suave)", fontSize: 12 }}>{a.clienteId}</span></td>
                  <td>
                    <button
                      onClick={() => copiar(a)}
                      title="Copiar el enlace de este cliente"
                      style={{ padding: "5px 10px", cursor: "pointer" }}
                    >
                      {copiado === a.token ? "¡Copiado!" : "Copiar enlace"}
                    </button>
                    <br />
                    <code style={{ fontSize: 11, color: "var(--suave)", wordBreak: "break-all" }}>
                      {`/v/${a.token.slice(0, 10)}…`}
                    </code>
                  </td>
                  <td>
                    {a.codigoCorto}
                    {a.clave ? (
                      <><br /><span style={{ fontSize: 11, color: "var(--sys-verde)" }}>🔒 con clave</span></>
                    ) : null}
                  </td>
                  <td>{fecha(a.expira)}</td>
                  <td>{!a.activo ? "Desactivado" : vencido ? "Vencido" : "Activo"}</td>
                  <td>{a.vistas ?? 0}</td>
                  <td>{fecha(a.ultimoAcceso)}</td>
                  <td>
                    <button onClick={() => revocar(a)} style={{ padding: "5px 10px" }}>
                      {a.activo ? "Desactivar" : "Reactivar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
