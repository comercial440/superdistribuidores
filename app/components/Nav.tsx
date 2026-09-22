"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ base, items }: { base: string; items: [string, string][] }) {
  const aqui = usePathname();
  return (
    <nav className="nav">
      {items.map(([ruta, texto]) => {
        const href = ruta ? `${base}/${ruta}` : base;
        const activo = ruta ? aqui.startsWith(href) : aqui === base;
        return (
          <Link key={ruta || "portada"} href={href} className={activo ? "activo" : ""}>
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
