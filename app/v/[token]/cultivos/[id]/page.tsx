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

  const criticas = c.etapas.reduce(
    (n, e) => n + (e.prods || []).filter((p) => p.k === "Crítica").length, 0);

  return (
    <>
      <p style={{ margin: "18px 0 10px" }}>
        <Link href={`/v/${params.token}/cultivos`}>← Manejo por cultivo</Link>
      </p>

      <div className="cultivo-head">
        <span className="emoji">{c.emoji}</span>
        <div>
          <h1>{c.nombre}</h1>
          <div className="tipo">{c.sci} · {c.fam}</div>
        </div>
      </div>
      <p className="bajada">{c.ciclo}</p>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
        <div className="card" style={{ margin: 0 }}>
          <span className="cifra">{c.etapas.length}</span>
          <span className="etiqueta">Etapas fenológicas</span>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <span className="cifra">{criticas}</span>
          <span className="etiqueta">Ventanas críticas</span>
        </div>
      </div>

      {c.nota && <div className="aviso">{c.nota}</div>}
      <p className="etiqueta" style={{ margin: "14px 0 0" }}>Escala fenológica</p>
      <p style={{ margin: "2px 0 4px", fontSize: 13, color: "var(--txt-soft)" }}>{c.refBBCH}</p>
      <div className="aviso" style={{ fontSize: 12.5 }}>
        <p style={{ margin: "0 0 6px" }}>
          <strong>BBCH</strong> — sigla de <em>Biologische Bundesanstalt, Bundessortenamt
          und CHemische Industrie</em>, las tres instituciones alemanas que la
          desarrollaron. Es la escala internacional que numera del <strong>00 al 99</strong>
          el desarrollo de un cultivo: 00 germinación, 60 plena floración, 89 madurez.
          Sirve para que cada etapa signifique lo mismo para todos: en vez de discutir si
          la planta «ya está en floración», se dice BBCH 65.
        </p>
        <p style={{ margin: "0 0 6px" }}>
          No todos los cultivos tienen escala BBCH publicada. Donde el programa técnico
          trabaja con sus propias etapas, el código se recupera de la escala del cultivo.
        </p>
        <p style={{ margin: 0, fontSize: 11.5 }}>
          Meier, U. (Ed.). (2018). <em>Growth stages of mono- and dicotyledonous plants:
          BBCH Monograph</em> (2.ª ed.). Julius Kühn-Institut.
          https://doi.org/10.5073/20180906-074619 · Lancashire, P. D., y col. (1991).
          A uniform decimal code for growth stages of crops and weeds.
          <em> Annals of Applied Biology, 119</em>(3), 561–601.
        </p>
      </div>

      {c.etapas.map((e) => (
        <section key={e.o}>
          <div className="etapa">
            <div className="lbl">{e.bbch ? `BBCH ${e.bbch} · ${e.dur}` : e.dur}</div>
            <div className="stage">{e.e}</div>
            <div className="nota">{e.dem}</div>
          </div>
          {e.prods?.length ? (
            <div className="tabla-envoltura">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th><th>Función</th><th>Dosis</th>
                    <th>Criticidad</th><th>Fundamento</th><th>Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {e.prods.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <strong style={{ color: "var(--sys-azul)" }}>{p.p}</strong>
                        {p.n && (
                          <><br /><span style={{ fontSize: 11.5, color: "var(--txt-soft)" }}>{p.n}</span></>
                        )}
                      </td>
                      <td>{p.f}</td>
                      <td>{p.d || <span className="pendiente">Sin dosis en ficha</span>}</td>
                      <td><span className={claseK(p.k)}>{p.k}</span></td>
                      <td>{p.fu}</td>
                      <td style={{ color: "var(--txt-soft)", whiteSpace: "nowrap" }}>{p.ref}</td>
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
