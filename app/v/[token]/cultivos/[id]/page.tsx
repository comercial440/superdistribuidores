import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAcceso, puedeVer } from "@/lib/accesos";
import { cultivoDe } from "@/lib/datos";

export const dynamic = "force-dynamic";

const claseK = (k: string) =>
  k === "Crítica" ? "k k-critica" : k === "Alta" ? "k k-alta" : "k k-media";

export default async function CultivoDetalle({
  params,
}: { params: { token: string; id: string } }) {
  const acceso = await exigirAcceso(params.token);
  if (!puedeVer(acceso, "cultivos")) notFound();
  const c = cultivoDe(acceso, params.id);
  if (!c) notFound();

  return (
    <>
      <p style={{ margin: "18px 0 0" }}>
        <Link href={`/v/${params.token}/cultivos`}>← Cultivos</Link>
      </p>
      <h1>{c.emoji} {c.nombre}</h1>
      <p style={{ margin: "0 0 4px", fontStyle: "italic", color: "var(--suave)" }}>
        {c.sci} · {c.fam}
      </p>
      <p className="bajada">{c.ciclo}</p>
      {c.nota && <div className="aviso">{c.nota}</div>}
      <p style={{ fontSize: 12.5, color: "var(--suave)" }}>
        Escala fenológica: {c.refBBCH}
      </p>

      {c.etapas.map((e) => (
        <section key={e.o} className="tarjeta">
          <p className="etiqueta" style={{ margin: 0 }}>
            {e.bbch ? `BBCH ${e.bbch} · ` : ""}{e.dur}
          </p>
          <h2 style={{ margin: "2px 0 6px" }}>{e.e}</h2>
          <p style={{ marginTop: 0 }}>{e.dem}</p>
          {e.prods?.length ? (
            <div className="tabla-envoltura">
              <table>
                <thead>
                  <tr><th>Producto</th><th>Función</th><th>Dosis</th><th>Criticidad</th><th>Fundamento</th><th>Referencia</th></tr>
                </thead>
                <tbody>
                  {e.prods.map((p, i) => (
                    <tr key={i}>
                      <td><strong>{p.p}</strong>{p.n && <><br /><span style={{ fontSize: 12, color: "var(--suave)" }}>{p.n}</span></>}</td>
                      <td>{p.f}</td>
                      <td>{p.d || <span className="pendiente">Sin dosis en ficha</span>}</td>
                      <td><span className={claseK(p.k)}>{p.k}</span></td>
                      <td>{p.fu}</td>
                      <td style={{ color: "var(--suave)" }}>{p.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="pendiente">Sin recomendación de portafolio para esta etapa.</p>
          )}
        </section>
      ))}
    </>
  );
}
