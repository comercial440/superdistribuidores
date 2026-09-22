import { exigirAcceso, diasRestantes, puedeVer } from "@/lib/accesos";
import { marcarVisita } from "@/lib/accesos";
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
  if (puedeVer(acceso, "competencia")) items.push(["competencia", "Comparativo"]);
  if (puedeVer(acceso, "cultivos")) items.push(["cultivos", "Manejo por cultivo"]);

  return (
    <>
      <header className="barra">
        <div className="envoltura">
          <div>
            <span className="marca">
              {acceso.titulo}
              <small>Grupo SYS · portafolio técnico</small>
            </span>
          </div>
          <span className={"vigencia" + (dias <= 2 ? " pronto" : "")}>
            {dias === 0
              ? "Vence hoy"
              : `Vigente ${dias} día${dias === 1 ? "" : "s"} más · hasta el ${FECHA.format(new Date(acceso.expira))}`}
          </span>
        </div>
        <div className="envoltura">
          <Nav base={base} items={items} />
        </div>
      </header>

      <main className="envoltura">{children}</main>

      <footer className="pie">
        <div className="envoltura">
          <p>
            <strong>Información de uso exclusivo de {acceso.destinatario}.</strong> Se comparte
            para el estudio de la propuesta comercial y no está autorizada su reproducción,
            distribución ni cesión a terceros.
          </p>
          <p>
            Contenido de solo lectura, con vigencia hasta el{" "}
            {FECHA.format(new Date(acceso.expira))}. Toda afirmación técnica remite al registro
            ICA y a la ficha técnica oficial del producto. Las dosis son rangos orientativos:
            el ajuste final es del ingeniero agrónomo, con análisis de suelo o tejido foliar.
          </p>
          <p>Grupo SYS · Science Yields Solutions S.A.S.</p>
        </div>
      </footer>
    </>
  );
}
