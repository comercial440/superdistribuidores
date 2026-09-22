import Link from "next/link";
import { exigirAcceso, puedeVer } from "@/lib/accesos";
import { cultivosDe, productosDe, META, PUNTO1 } from "@/lib/datos";

export const dynamic = "force-dynamic";

export default async function Portada({ params }: { params: { token: string } }) {
  const acceso = await exigirAcceso(params.token);
  const base = `/v/${params.token}`;
  const cultivos = cultivosDe(acceso);
  const productos = productosDe(acceso);
  const etapas = cultivos.reduce((n, c) => n + c.etapas.length, 0);

  return (
    <>
      <h1>Portafolio técnico Grupo SYS</h1>
      <p className="bajada">
        Cada producto con su registro ICA, su composición garantizada tal como la declara la
        ficha técnica oficial, la ventana fenológica en la que aporta y el comparativo contra
        el producto equivalente de cada casa. Sin cifras de venta y sin condiciones comerciales:
        esas van por separado.
      </p>

      <div className="rejilla">
        <div className="tarjeta">
          <span className="cifra">{productos.length}</span>
          <p className="etiqueta">Productos con ficha</p>
        </div>
        <div className="tarjeta">
          <span className="cifra">{cultivos.length}</span>
          <p className="etiqueta">Cultivos del territorio</p>
        </div>
        <div className="tarjeta">
          <span className="cifra">{etapas}</span>
          <p className="etiqueta">Etapas fenológicas</p>
        </div>
        <div className="tarjeta">
          <span className="cifra">{PUNTO1.competencia ? Object.values(PUNTO1.competencia).reduce((n: number, v: any) => n + v.length, 0) : 0}</span>
          <p className="etiqueta">Fichas de competencia cotejadas</p>
        </div>
      </div>

      <h2>Qué encontrará aquí</h2>
      <div className="rejilla">
        {puedeVer(acceso, "portafolio") && (
          <Link href={`${base}/portafolio`} className="tarjeta" style={{ textDecoration: "none", display: "block" }}>
            <h3 style={{ margin: 0 }}>Portafolio y equivalentes</h3>
            <p style={{ color: "var(--suave)", margin: "6px 0 0" }}>
              Registro ICA, composición garantizada, propiedades fisicoquímicas, dosis en rango
              y la observación técnica que separa a cada producto de su equivalente.
            </p>
          </Link>
        )}
        {puedeVer(acceso, "cultivos") && (
          <Link href={`${base}/cultivos`} className="tarjeta" style={{ textDecoration: "none", display: "block" }}>
            <h3 style={{ margin: 0 }}>Manejo por cultivo</h3>
            <p style={{ color: "var(--suave)", margin: "6px 0 0" }}>
              En qué etapa fenológica entra cada producto, por qué, con qué dosis y con qué
              referencia lo sostiene.
            </p>
          </Link>
        )}
        {puedeVer(acceso, "competencia") && (
          <Link href={`${base}/competencia`} className="tarjeta" style={{ textDecoration: "none", display: "block" }}>
            <h3 style={{ margin: 0 }}>Comparativo ficha a ficha</h3>
            <p style={{ color: "var(--suave)", margin: "6px 0 0" }}>
              Lo que declara cada envase, por familia de producto. Solo cifras impresas en una
              ficha oficial: ninguna estimación.
            </p>
          </Link>
        )}
      </div>

      <h2>De dónde sale la información</h2>
      <div className="tarjeta">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {(META.fuentes || []).map((f: string) => <li key={f}>{f}</li>)}
        </ul>
      </div>
    </>
  );
}
