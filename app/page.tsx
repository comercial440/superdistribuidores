export const dynamic = "force-dynamic";

// Raíz sin contenido: a esta vista se entra por el enlace propio de cada cliente.
export default function Inicio() {
  return (
    <main className="centro">
      <h1>Superdistribuidores</h1>
      <p className="bajada">
        Esta vista se consulta con el enlace que le fue enviado. Si lo tiene a la mano,
        ábralo de nuevo; si no, solicítelo a su contacto en Grupo SYS.
      </p>
    </main>
  );
}
