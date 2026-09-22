import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAcceso, puedeVer } from "@/lib/accesos";
import { productoDe, familiaDe, fichaPunto1, idPorNombreCultivo, cultivoPorNombre } from "@/lib/datos";

export const dynamic = "force-dynamic";

const claseK = (k: string) =>
  k === "Crítica" ? "k k-critica" : k === "Alta" ? "k k-alta" : "k k-media";

export default async function Ficha({
  params,
}: { params: { token: string; id: string } }) {
  const acceso = await exigirAcceso(params.token);
  if (!puedeVer(acceso, "portafolio")) notFound();
  const p = productoDe(acceso, params.id);
  if (!p) notFound();

  const familia = familiaDe(p.p);
  const p1 = fichaPunto1(p.p);
  const cultivos = Object.entries(p.cultivos);

  return (
    <>
      <p style={{ margin: "18px 0 0" }}>
        <Link href={`/v/${params.token}/portafolio`}>← Portafolio</Link>
      </p>
      <h1>{p.p}</h1>
      <p style={{ margin: "0 0 4px" }}>
        <span className="ica">Registro ICA {p.ica}</span>{" "}
        <span className="etiqueta">{p.cat}</span>
      </p>
      <p className="bajada">{p.f}</p>

      <h2>Ficha técnica</h2>
      <div className="card">
        <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "minmax(140px,auto) 1fr", gap: "8px 18px" }}>
          <dt className="etiqueta">Composición garantizada</dt>
          <dd style={{ margin: 0 }}>{p1?.composicion || p.el}</dd>
          {p.ficha?.via && (<><dt className="etiqueta">Vía de aplicación</dt><dd style={{ margin: 0 }}>{p.ficha.via}</dd></>)}
          {p1?.forma && (<><dt className="etiqueta">Formulación</dt><dd style={{ margin: 0 }}>{p1.forma}</dd></>)}
          <dt className="etiqueta">Dosis</dt>
          <dd style={{ margin: 0 }}>
            {p1?.dosis || p.ficha?.dosis || (
              <span className="pendiente">La ficha oficial no publica dosis para este producto.</span>
            )}
          </dd>
          {(p1?.fisico || p.ficha?.fq) && (<><dt className="etiqueta">Propiedades</dt><dd style={{ margin: 0 }}>{p1?.fisico || p.ficha?.fq}</dd></>)}
          {p.ficha?.pres && (<><dt className="etiqueta">Presentaciones</dt><dd style={{ margin: 0 }}>{p.ficha.pres}</dd></>)}
          {p.bbch && (<><dt className="etiqueta">Ventana BBCH</dt><dd style={{ margin: 0 }}>{p.bbch}</dd></>)}
        </dl>
      </div>

      {p1?.nota && (
        <div className="aviso">
          <strong>Observación técnica.</strong> {p1.nota}
        </div>
      )}

      {p.ficha?.mezcla && (
        <>
          <h2>Mezcla y compatibilidad</h2>
          <div className="card"><p style={{ margin: 0 }}>{p.ficha.mezcla}</p></div>
        </>
      )}

      {p.ficha?.equiv && (
        <>
          <h2>Equivalentes en el mercado</h2>
          <div className="card"><p style={{ margin: 0 }}>{p.ficha.equiv}</p></div>
        </>
      )}

      {familia && puedeVer(acceso, "competencia") && (
        <>
          <h2>Cabeza a cabeza · {familia.nombre}</h2>
          <p className="bajada">
            Lo que declara cada ficha, en {familia.unidad}. Cifras impresas en el envase o en la
            ficha oficial de cada casa.
          </p>
          <div className="tabla-envoltura">
            <table>
              <thead>
                <tr>
                  <th>Producto</th><th>Casa</th>
                  {familia.cols.map((c: string) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {familia.rows.map((r: any, i: number) => (
                  <tr key={i} className={r.casa === "SYS" ? "sys" : ""}>
                    <td>{r.p}</td><td>{r.casa}</td>
                    {familia.cols.map((c: string) => <td key={c}>{r.v?.[c] ?? "—"}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {cultivos.length > 0 && puedeVer(acceso, "cultivos") && (
        <>
          <h2>Potencial por cultivo y etapa</h2>
          <p className="bajada">
            {p.nc} cultivos · {p.ne} etapas · {p.nk} de ellas en ventana crítica. La dosis,
            el fundamento y la referencia de cada etapa están en la ficha del cultivo.
          </p>
          {cultivos.map(([cultivo, recs]) => (
            <section key={cultivo}>
              <h3>
                {puedeVer(acceso, "cultivos") && idPorNombreCultivo(acceso, cultivo) ? (
                  <Link href={`/v/${params.token}/cultivos/${idPorNombreCultivo(acceso, cultivo)}`}>
                    {cultivo}
                  </Link>
                ) : cultivo}
              </h3>
              <div className="tabla-envoltura">
                <table>
                  <thead>
                    <tr><th>Etapa fenológica</th><th>BBCH</th><th>Criticidad</th></tr>
                  </thead>
                  <tbody>
                    {recs.map((r, i) => {
                      // Dos casos distintos: que el cultivo no tenga escala BBCH
                      // publicada, o que la tenga pero el programa trabaje con sus
                      // propias etapas y no escriba el código.
                      const c = cultivoPorNombre(acceso, cultivo);
                      const sinEscala = c && c.escalaPublicada === false;
                      return (
                        <tr key={i}>
                          <td>{r.e}</td>
                          <td>
                            {r.bbch || (
                              <span className="pendiente">
                                {sinEscala ? "sin escala BBCH publicada" : "no lo indica el programa"}
                              </span>
                            )}
                          </td>
                          <td><span className={claseK(r.k)}>{r.k}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </>
      )}

      {p.ev && (
        <>
          <h2>Evidencia</h2>
          <div className="card"><p style={{ margin: 0, color: "var(--suave)" }}>{p.ev}</p></div>
        </>
      )}
    </>
  );
}
