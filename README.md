# Superdistribuidores

Vista de **solo lectura** del portafolio técnico de Grupo SYS para un distribuidor,
con acceso por enlace propio, temporal y revocable.

Es una aplicación **aparte** del portal interno (`clima_agricola_sys`), a propósito:
el portal protege todo con una clave compartida y una sesión válida allí abre el
portal entero (compromisos, gente, estudio de mercado). Aquí el modelo es el
contrario — no se ve nada sin un acceso vigente, y cada acceso define qué ve.

## Cómo se entrega un enlace

1. Entrar a `/admin` con la clave (`SD_ADMIN_PASSWORD`).
2. **Emitir un enlace**: identificador interno, destinatario, vigencia (8 días por
   defecto) y los cultivos visibles.
3. Copiar el enlace y **entregarlo usted misma** por el canal que corresponda.
   La aplicación no envía nada a nadie.

Para **revocar**: en la tabla, «Desactivar». Surte efecto en la siguiente petición,
sin volver a publicar. Un enlace vencido o desactivado muestra una pantalla de
acceso no válido, nunca contenido parcial.

## Alcance por cliente

Cada acceso es un documento de la colección `sd_accesos` en Firestore:

| Campo | Para qué |
|---|---|
| `token` | El secreto que va en la URL (`/v/<token>`) |
| `codigoCorto` | Alterno, dictable por otro canal |
| `clienteId` | Interno; **nunca** se muestra en la página |
| `titulo` / `destinatario` | Lo que ve el cliente y lo que dice el pie |
| `zonas` / `cultivos` | Alcance; `cultivos` vacío = todos |
| `secciones` | `portafolio`, `competencia`, `cultivos` |
| `expira` / `activo` | Vigencia y revocación |
| `vistas` / `ultimoAcceso` | Trazabilidad |

Los conteos que ve el cliente (cultivos, etapas, ventanas críticas de cada producto)
**se recalculan sobre su alcance**, para que la página no prometa cultivos que no muestra.

## Los datos

La aplicación **no importa nada** de `sys_tools` ni del portal interno. Consume los
archivos de `data/`, que genera:

```bash
python3 ~/sys_tools/superdistribuidores/build_datos.py
```

Ese generador trabaja con **lista blanca**: solo sale lo que está nombrado en él.
Quedan fuera, por decisión explícita:

- `punto1_marquez/build_interno.py` (argumentos de venta, «dónde no ganamos»): no se importa.
- De `competencia.json`: `mapa` (ventas de competidores), `zonas` (reportes de choque
  por zona) y `casas` (dónde compite cada casa). Es inteligencia interna.
- Las frases con valor por hectárea en pesos que trae el Atlas en sus notas.

Antes de escribir, el generador revisa la salida contra una lista de patrones
prohibidos (pesos, margen, rentabilidad, rebate, descuento, lista de precios, nombre
del cliente, Kelamix con nombre de cliente) y **aborta** si encuentra alguno.

## Los cuatro cultivos de ladera

El Atlas del portal cubría 17 cultivos y no incluía lulo, granadilla, fríjol ni
pastos. Se construyeron en `sys_tools/superdistribuidores/cultivos_ladera.py`
sobre las fases ya auditadas de `manejo_agronomico.json`. Total ahora: **21
cultivos y 108 etapas**.

`validar_cultivos.py` corre **antes** de cada build y aborta si algo no cuadra:

1. El producto existe en el portafolio publicado.
2. **Toda dosis es cita literal de la ficha técnica.** Ninguna ficha publica dosis
   para estos cuatro cultivos, así que se cita la dosis general del D-INV-005 y
   la salvedad queda escrita en la propia fila. Donde no hay ni general, la página
   dice «Sin dosis en ficha».
3. Toda referencia resuelve contra `referencias.json` o contra las fuentes del
   cultivo.
4. La criticidad usa el vocabulario del Atlas y ninguna fila sin dosis queda sin nota.

**BBCH.** Solo lulo y fríjol llevan código. Lulo tiene escala BBCH publicada
(Ramírez & Davenport, 2019, DOI 10.1080/15538362.2019.1613470, comprobada en
Crossref) y fríjol la tiene en Feller et al. (1995). Para **granadilla y pastos no
existe escala BBCH publicada**: el campo va vacío y la página lo dice, en vez de
llevar un código inventado.

**Arracacha no está**: no aparece en el Atlas, ni en los 45 cultivos del manejo
agronómico, ni en los calendarios. Construirla es investigación nueva.

## Correr y publicar

`node_modules` no vive en Drive (son miles de archivos sincronizando). Para publicar
no hace falta: Vercel compila en su servidor.

```bash
npx vercel --prod --yes
```

Variables a configurar en Vercel: ver `.env.example`.

Para compilar en el computador, copiar el proyecto fuera de Drive, `npm install` allí
y `npx next build`.

## Lo que NO está aquí, a propósito

Ventas por cultivo o zona, lista de precios, condiciones comerciales y potencial de
ladera. Son entregables aparte.
