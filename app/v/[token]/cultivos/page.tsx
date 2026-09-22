import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAcceso, puedeVer } from "@/lib/accesos";
import { cultivosDe } from "@/lib/datos";

export const dynamic = "force-dynamic";

export default async function Cultivos({ params }: { params: { token: string } }) {
  const acceso = await exigirAcceso(params.token);
  if (!puedeVer(acceso, "cultivos")) notFound();
  const cultivos = cultivosDe(acceso);

  return (
    <>
      <h1>Manejo técnico por cultivo</h1>
      <p className="bajada">
        Para cada cultivo, sus etapas fenológicas en escala BBCH, qué demanda la planta en cada
        una y qué producto del portafolio entra, con su dosis y la referencia que lo sostiene.
      </p>
      <div className="rejilla">
        {cultivos.map((c) => {
          const criticas = c.etapas.reduce(
            (n, e) => n + (e.prods || []).filter((p) => p.k === "Crítica").length, 0);
          return (
            <Link
              key={c.id}
              href={`/v/${params.token}/cultivos/${c.id}`}
              className="tarjeta"
              style={{ textDecoration: "none", display: "block", margin: 0 }}
            >
              <h3 style={{ margin: "0 0 2px" }}>{c.emoji} {c.nombre}</h3>
              <p style={{ margin: "0 0 8px", color: "var(--suave)", fontStyle: "italic", fontSize: 13 }}>{c.sci}</p>
              <p style={{ margin: 0, fontSize: 12.5, color: "var(--suave)" }}>
                {c.etapas.length} etapas · {criticas} ventanas críticas
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
