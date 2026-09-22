import { notFound } from "next/navigation";
import { exigirAcceso, puedeVer } from "@/lib/accesos";
import { COMPETENCIA, gruposCompetencia, PUNTO1 } from "@/lib/datos";

export const dynamic = "force-dynamic";

export default async function Competencia({ params }: { params: { token: string } }) {
  const acceso = await exigirAcceso(params.token);
  if (!puedeVer(acceso, "competencia")) notFound();

  const familias = (COMPETENCIA.familias || []) as any[];
  const grupos = gruposCompetencia();
  const matrices = (PUNTO1.matrices || []) as any[];

  return (
    <>
      <h1>Comparativo ficha a ficha</h1>
      <p className="bajada">
        Cada cifra está impresa en una ficha técnica oficial o en el registro ICA del producto.
        Donde una casa no publica el dato, dice «no lo declara»: no se estima.
      </p>

      <h2>Por familia de producto</h2>
      {familias.map((f) => (
        <section key={f.id}>
          <h3>{f.nombre}</h3>
          <p style={{ color: "var(--suave)", margin: "0 0 8px", fontSize: 13 }}>
            Unidad: {f.unidad}
          </p>
          <div className="tabla-envoltura">
            <table>
              <thead>
                <tr><th>Producto</th><th>Casa</th>{f.cols.map((c: string) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {f.rows.map((r: any, i: number) => (
                  <tr key={i} className={r.casa === "SYS" ? "sys" : ""}>
                    <td>{r.p}</td><td>{r.casa}</td>
                    {f.cols.map((c: string) => <td key={c}>{r.v?.[c] ?? "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <h2>Cuadros de detalle</h2>
      {matrices.map((m) => (
        <section key={m.titulo}>
          <h3>{m.titulo}</h3>
          {m.sub && <p style={{ color: "var(--suave)", margin: "0 0 8px", fontSize: 13 }}>{m.sub}</p>}
          <div className="tabla-envoltura">
            <table>
              <thead><tr>{m.header.map((h: string) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {m.rows.map((r: string[], i: number) => (
                  <tr key={i} className={/SYS|Calcibor|Ares|Fertisys|Acuaphyte|Aminosys|Synestress|Kelasys|Potensys|PTC/.test(r[0]) ? "sys" : ""}>
                    {r.map((c, j) => <td key={j}>{c || "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {m.lectura && <div className="aviso" style={{ marginTop: 10 }}><strong>Cómo se lee.</strong> {m.lectura}</div>}
        </section>
      ))}

      <h2>Fichas cotejadas, por grupo</h2>
      <p className="bajada">
        Lo que declara cada ficha del grupo, incluida la de SYS, en las mismas columnas.
      </p>
      {grupos.map(([grupo, filas]) => (
        <section key={grupo}>
          <h3>{grupo}</h3>
          <div className="tabla-envoltura">
            <table>
              <thead>
                <tr><th>Casa</th><th>Producto</th><th>Registro</th><th>Composición declarada</th><th>Propiedades</th><th>Dosis</th><th>Observación</th></tr>
              </thead>
              <tbody>
                {filas.map((r: any, i: number) => (
                  <tr key={i} className={r.casa === "SYS" ? "sys" : ""}>
                    <td>{r.casa}</td><td>{r.producto}</td><td>{r.registro}</td>
                    <td>{r.composicion}</td><td>{r.fisico}</td>
                    <td>{r.dosis || <span className="pendiente">No la publica</span>}</td>
                    <td style={{ color: "var(--suave)" }}>{r.nota || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
