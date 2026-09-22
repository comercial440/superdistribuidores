import { notFound } from "next/navigation";
import Link from "next/link";
import { exigirAcceso, puedeVer } from "@/lib/accesos";
import { TERRITORIO, cultivosDe } from "@/lib/datos";

export const dynamic = "force-dynamic";

const ha = (n: number) => n.toLocaleString("es-CO");

function Barras({ datos, total }: { datos: Record<string, number>; total: number }) {
  const max = Math.max(...Object.values(datos), 1);
  return (
    <div className="tabla-envoltura">
      <table>
        <thead><tr><th>Cultivo</th><th style={{ width: "55%" }}>Área sembrada</th><th>Hectáreas</th><th>% del total</th></tr></thead>
        <tbody>
          {Object.entries(datos).map(([k, v]) => (
            <tr key={k}>
              <td><strong>{k}</strong></td>
              <td>
                <span style={{
                  display: "block", height: 10, borderRadius: 5,
                  width: `${Math.max(2, (v / max) * 100)}%`,
                  background: "linear-gradient(90deg, var(--sys-verde-2), var(--sys-verde))",
                }} />
              </td>
              <td style={{ textAlign: "right", fontWeight: 700, color: "var(--sys-azul)", whiteSpace: "nowrap" }}>{ha(v)}</td>
              <td style={{ textAlign: "right", color: "var(--txt-soft)" }}>{((v / total) * 100).toFixed(1)} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function Potencial({ params }: { params: { token: string } }) {
  const acceso = await exigirAcceso(params.token);
  if (!puedeVer(acceso, "cultivos")) notFound();
  const T = TERRITORIO;
  const cultivos = cultivosDe(acceso);
  const conPrograma = new Set(cultivos.map((c) => c.nombre.toLowerCase()));

  return (
    <>
      <h1>Potencial de cultivos del territorio</h1>
      <p className="bajada">
        Área sembrada de los cultivos del territorio, municipio por municipio.
        Son hectáreas reportadas, no estimaciones: la referencia de tamaño sobre la
        que se construye el programa técnico.
      </p>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        <div className="card" style={{ margin: 0 }}>
          <span className="cifra">{ha(T.total)}</span>
          <span className="etiqueta">Hectáreas sembradas</span>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <span className="cifra">{T.municipios}</span>
          <span className="etiqueta">Municipios</span>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <span className="cifra">{Object.keys(T.porDepartamento).length}</span>
          <span className="etiqueta">Departamentos</span>
        </div>
        <div className="card" style={{ margin: 0 }}>
          <span className="cifra">{Object.keys(T.porCultivo).length}</span>
          <span className="etiqueta">Cultivos medidos</span>
        </div>
      </div>

      <h2>Por cultivo</h2>
      <Barras datos={T.porCultivo} total={T.total} />

      <h2>Por departamento</h2>
      <Barras datos={T.porDepartamento} total={T.total} />

      <h2>Por zona</h2>
      <Barras datos={T.porZona} total={T.total} />

      <div className="aviso">
        <strong>Fuente.</strong> {T.fuente}. Las hectáreas son del último año
        publicado; el Ministerio revisa cifras de años ya publicados, así que pueden
        moverse en revisiones posteriores.
      </div>

      {puedeVer(acceso, "cultivos") && (
        <p style={{ marginTop: 18 }}>
          El manejo técnico de estos cultivos, etapa por etapa, está en{" "}
          <Link href={`/v/${params.token}/cultivos`}>Manejo por cultivo</Link>
          {conPrograma.size > 0 && ` (${cultivos.length} cultivos con programa)`}.
        </p>
      )}
    </>
  );
}
