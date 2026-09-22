import Link from "next/link";
import { notFound } from "next/navigation";
import { exigirAcceso, puedeVer } from "@/lib/accesos";
import { productosDe } from "@/lib/datos";

export const dynamic = "force-dynamic";

export default async function Portafolio({ params }: { params: { token: string } }) {
  const acceso = await exigirAcceso(params.token);
  if (!puedeVer(acceso, "portafolio")) notFound();
  const productos = productosDe(acceso);

  const porCategoria = new Map<string, typeof productos>();
  for (const p of productos) {
    const k = p.cat?.split("·")[0].trim() || "Otros";
    if (!porCategoria.has(k)) porCategoria.set(k, []);
    porCategoria.get(k)!.push(p);
  }

  return (
    <>
      <h1>Portafolio y equivalentes de competencia</h1>
      <p className="bajada">
        {productos.length} productos. Cada ficha abre con el registro ICA, la composición
        garantizada, las propiedades declaradas, la dosis en rango y el equivalente de cada casa.
      </p>

      {[...porCategoria.entries()].map(([cat, lista]) => (
        <section key={cat}>
          <h2>{cat}</h2>
          <div className="rejilla">
            {lista.map((p) => (
              <Link
                key={p.id}
                href={`/v/${params.token}/portafolio/${p.id}`}
                className="tarjeta"
                style={{ textDecoration: "none", display: "block", margin: 0 }}
              >
                <h3 style={{ margin: "0 0 4px" }}>{p.p}</h3>
                <p style={{ margin: "0 0 8px" }}>
                  <span className="ica">ICA {p.ica}</span>{" "}
                  <span className="etiqueta">{p.o}</span>
                </p>
                <p style={{ color: "var(--suave)", margin: 0, fontSize: 13.5 }}>{p.el}</p>
                {p.nc > 0 && (
                  <p style={{ margin: "10px 0 0", fontSize: 12.5, color: "var(--suave)" }}>
                    {p.nc} cultivos · {p.ne} etapas · {p.nk} ventanas críticas
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
