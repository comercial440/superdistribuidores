// Lectura del paquete de datos PUBLICABLE. Estos archivos los genera
// sys_tools/superdistribuidores/build_datos.py con lista blanca; esta app no
// importa nada de sys_tools ni del portal interno.
import portafolioJson from "@/data/portafolio.json";
import fenologiaJson from "@/data/fenologia.json";
import competenciaJson from "@/data/competencia.json";
import punto1Json from "@/data/punto1.json";
import metaJson from "@/data/meta.json";
import territorioJson from "@/data/territorio.json";
import type { Acceso } from "@/lib/accesos";

export interface Ficha {
  via?: string; equiv?: string; dosis?: string; fq?: string;
  pres?: string; mezcla?: string; carencia?: string; uso?: string;
}
/** Recomendación completa: vive en las etapas de cada cultivo. */
export interface Recomendacion {
  p: string; f: string; d: string; k: string; fu: string; ref: string; n?: string;
}
/**
 * Lo que guarda un producto sobre cada cultivo NO es la recomendación completa,
 * sino en qué etapa participa y con qué criticidad. El detalle (función, dosis,
 * fundamento, referencia) vive en el cultivo, no en el producto.
 */
export interface EtapaDeProducto {
  o: number; bbch: string; e: string; k: string;
}
export interface Producto {
  id: string; p: string; emp: string; o: string; cat: string; f: string;
  el: string; ica: string; bbch: string; ev: string; ficha?: Ficha;
  sinDosis?: boolean; ne: number; nk: number; nc: number;
  cultivos: Record<string, EtapaDeProducto[]>;
}
export interface Etapa {
  o: number; bbch: string; e: string; dur: string; dem: string; prods: Recomendacion[];
}
export interface Cultivo {
  id: string; nombre: string; emoji: string; sci: string; fam: string;
  refBBCH: string; ciclo: string; nota: string; area: number;
  /** ¿Existe escala BBCH publicada para este cultivo? Los del Atlas la tienen. */
  escalaPublicada?: boolean;
  etapas: Etapa[];
}

export const META = metaJson as any;
export const TERRITORIO = territorioJson as any;
export const PUNTO1 = punto1Json as any;
export const COMPETENCIA = competenciaJson as any;
const PRODUCTOS = (portafolioJson as any).productos as Producto[];
const CULTIVOS = (fenologiaJson as any).cultivos as Cultivo[];

/** Cultivos visibles para este acceso. Lista vacía en el acceso = todos. */
export function cultivosDe(a: Acceso): Cultivo[] {
  if (!a.cultivos?.length) return CULTIVOS;
  const permitidos = new Set(a.cultivos);
  return CULTIVOS.filter((c) => permitidos.has(c.id));
}

export function cultivoDe(a: Acceso, id: string): Cultivo | null {
  return cultivosDe(a).find((c) => c.id === id) ?? null;
}

/**
 * Productos recortados al alcance del acceso: solo quedan las recomendaciones
 * de los cultivos visibles, y los conteos (etapas, críticas, cultivos) se
 * recalculan sobre lo que el cliente realmente ve. Si se dejaran los conteos
 * originales, la página prometería cultivos que no muestra.
 */
export function productosDe(a: Acceso): Producto[] {
  const visibles = new Set(cultivosDe(a).map((c) => c.nombre));
  return PRODUCTOS.map((p) => {
    const cultivos: Record<string, EtapaDeProducto[]> = {};
    for (const [nombre, recs] of Object.entries(p.cultivos || {})) {
      if (visibles.has(nombre)) cultivos[nombre] = recs;
    }
    const listas = Object.values(cultivos);
    return {
      ...p,
      cultivos,
      nc: listas.length,
      ne: listas.reduce((n, r) => n + r.length, 0),
      nk: listas.reduce((n, r) => n + r.filter((x) => x.k === "Crítica").length, 0),
    };
  }).filter((p) => p.nc > 0 || !!p.ficha);
}

export function productoDe(a: Acceso, id: string): Producto | null {
  return productosDe(a).find((p) => p.id === id) ?? null;
}

/** Cultivo por nombre, para resolver su escala y su id desde la ficha del producto. */
export function cultivoPorNombre(a: Acceso, nombre: string): Cultivo | null {
  return cultivosDe(a).find((c) => c.nombre === nombre) ?? null;
}

/** Nombre de cultivo -> id, para enlazar la ficha del producto con el cultivo. */
export function idPorNombreCultivo(a: Acceso, nombre: string): string | null {
  return cultivosDe(a).find((c) => c.nombre === nombre)?.id ?? null;
}

/** Familia comparativa a la que pertenece un producto SYS, si la tiene. */
export function familiaDe(nombre: string): any | null {
  const fam = COMPETENCIA.sysFamilia?.[nombre]
    ?? COMPETENCIA.sysFamilia?.[nombre.replace(/ SYS$/, "")];
  if (!fam) return null;
  return (COMPETENCIA.familias || []).find((f: any) => f.id === fam) ?? null;
}

/** Ficha del punto 1 (composición garantizada textual) por nombre de producto. */
const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

export function fichaPunto1(nombre: string): any | null {
  const n = norm(nombre);
  return (PUNTO1.sys || []).find((r: any) =>
    norm(r.producto) === n || norm(r.producto) === norm(nombre + " SYS")
    || norm(r.producto + " sys") === n) ?? null;
}

/** Fichas de competencia del punto 1, agrupadas por familia comercial. */
export function gruposCompetencia(): [string, any[]][] {
  return Object.entries(PUNTO1.competencia || {}) as [string, any[]][];
}
