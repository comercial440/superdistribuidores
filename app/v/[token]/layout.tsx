import { exigirAcceso, diasRestantes, puedeVer, marcarVisita } from "@/lib/accesos";
import Nav from "@/app/components/Nav";

export const dynamic = "force-dynamic";

const FECHA = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric" });

export default async function VistaLayout({
  children, params,
}: { children: React.ReactNode; params: { token: string } }) {
  const acceso = await exigirAcceso(params.token);
  await marcarVisita(acceso);

  const dias = diasRestantes(acceso);
  const base = `/v/${params.token}`;
  const items: [string, string][] = [["", "Portada"]];
  if (puedeVer(acceso, "portafolio")) items.push(["portafolio", "Portafolio"]);
  if (puedeVer(acceso, "cultivos")) items.push(["cultivos", "Manejo por cultivo"]);
  if (puedeVer(acceso, "cultivos")) items.push(["potencial", "Potencial del territorio"]);
  if (puedeVer(acceso, "competencia")) items.push(["competencia", "Comparativo"]);

  return (
    <>
      <header className="top">
        <div className="wrap">
          <div className="top-row">
            <span className="wordmark">
              <span className="leaf">🌿</span> GRUPO SYS
              <span className="sub">· Portafolio técnico</span>
            </span>
            <span className={"vigencia" + (dias <= 2 ? " pronto" : "")}>
              {dias === 0
                ? "Vence hoy"
                : `Vigente ${dias} día${dias === 1 ? "" : "s"} · hasta el ${FECHA.format(new Date(acceso.expira))}`}
            </span>
          </div>
          <div className="top-intro">
            <h1>{acceso.titulo}</h1>
            <p>
              Portafolio de Grupo SYS con su registro ICA y su composición garantizada, el manejo
              técnico por cultivo y etapa fenológica, y el comparativo contra el producto
              equivalente de cada casa.
            </p>
          </div>
          <Nav base={base} items={items} />
        </div>
      </header>

      <main className="wrap">{children}</main>

      <footer className="foot">
        <div className="wrap" style={{ paddingBottom: 0 }}>
          <p>
            <strong>Información de uso exclusivo de {acceso.destinatario}.</strong> Se comparte
            para el estudio de la propuesta comercial y no está autorizada su reproducción,
            distribución ni cesión a terceros.
          </p>
          <p>
            Contenido de solo lectura, vigente hasta el {FECHA.format(new Date(acceso.expira))}.
            Toda afirmación técnica remite al registro ICA y a la ficha técnica oficial del
            producto. Las dosis son rangos orientativos: el ajuste final es del ingeniero
            agrónomo, con análisis de suelo o tejido foliar.
          </p>
          <p>Grupo SYS · Science Yields Solutions S.A.S.</p>
        </div>
      </footer>
    </>
  );
}
