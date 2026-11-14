# Emiliano D'Ambrosio — Portfolio

Portfolio con salida estática construido con Astro, React y CSS con metodología BEM. El HTML de referencia es un punto de partida visual: el contenido y el diseño todavía son provisionales.

## Desarrollo local

Requiere Node.js 22.23.4 o superior (se recomienda Node 24 actualizado).

```sh
pnpm install
pnpm dev
```

Se utiliza pnpm 9.12.2. En Windows, si PowerShell bloquea los scripts, utilizar `pnpm.cmd` en lugar de `pnpm`.

## Verificación y producción

```sh
pnpm check
pnpm build
pnpm test
pnpm preview
```

Los tests inspeccionan el sitio compilado y la coordinación de carga de los recursos críticos: ejecutar el build primero. `pnpm test` no incluye una comprobación visual en navegador de la animación.

Publicar `dist/` en un hosting estático. El `index.html` de la raíz conserva la versión anterior como referencia; la entrada actual es `src/pages/index.astro`. Ejecutar los comandos desde la raíz del repositorio.

## Tema, idioma y CV

- Los toggles del header usan `PreferencesContext` para cambiar entre claro/oscuro y español/inglés. Las preferencias se guardan localmente; si el almacenamiento no está disponible, los controles siguen funcionando durante la sesión.
- El modo claro conserva la paleta original. El oscuro cambia únicamente los tonos neutros; no invierte fotografías ni modifica el naranja.
- El botón de descarga abre un modal con `[ES]` y `[EN]`, sin pregunta. Escape o un clic fuera del modal permiten cerrarlo. El idioma del CV se elige independientemente del idioma de la página.

Los PDF se toman de la carpeta `CV/` durante el build, sin modificar sus bytes:

| Descarga | Archivo fuente |
| --- | --- |
| `/cv/es.pdf` | `CV/CV_Emiliano_D'Ambrosio_Desarrollador_Frontend.pdf` |
| `/cv/en.pdf` | `CV/CV_Emiliano_D'Ambrosio_Frontend_Developer.pdf` |

`/CV-emiliano.pdf` se conserva como alias del CV español actual. Al reemplazar un PDF, volver a compilar el sitio.

## Dónde realizar cambios

| Ubicación | Responsabilidad |
| --- | --- |
| `src/data/portfolio.ts` | Perfil, proyectos, experiencia, habilidades y cursos |
| `src/data/translations.ts` | Textos de interfaz y contenido localizado ES/EN |
| `src/context/PreferencesContext.tsx` | Estado compartido de tema e idioma |
| `src/components/PortfolioApp.tsx` | Composición de las secciones dentro del contexto React |
| `src/components/*.tsx` | Cards, controles, modal y contenedor de sección |
| `src/styles/global.css` | Variables visuales, bloques BEM y reglas responsive |
| `src/layouts/BaseLayout.astro` | Metadatos y estructura del documento |
| `src/pages/index.astro` | Montaje de la raíz React con `client:load` |
| `src/data/cv.ts` | Nombres de los PDF utilizados por los enlaces y endpoints |

Astro genera HTML inicial en español y modo oscuro. Una sola raíz React se hidrata para que los controles y todas las secciones compartan el mismo contexto. No se utilizan islas independientes para estado compartido. Las clases siguen `bloque__elemento--modificador`; no se utiliza Tailwind. GSAP anima únicamente la introducción de carga.

Las fuentes se alojan localmente en `public/fonts/`, con sus licencias: Cabinet Grotesk Medium (500) para títulos y DM Sans Regular (400) para texto.

## Imágenes e introducción de carga

- `src/pages/index.astro` usa `getImage()` de Astro durante el build para generar variantes WebP responsive del retrato y las capturas de proyectos. React recibe únicamente sus URL, dimensiones y `srcSet`; no ejecuta el servicio de imágenes en el navegador.
- El hero tiene preload responsive, carga inmediata y prioridad alta. Las demás imágenes de contenido conservan carga nativa `lazy` y dimensiones explícitas. Los logos SVG se mantienen como SVG, sin rasterizarlos.
- `IntroLoader.astro` presenta el logo centrado sobre negro. GSAP anima un recorte ondulado ascendente y después desenfoca el logo y desvanece la pantalla. El llenado es una animación, no un porcentaje de descarga.
- `src/assets/intro-logo.png` conserva el PNG original de 2146 × 2146 extraído del SVG del paquete `ed-favicon/`, que no contiene trazos vectoriales. Astro genera la versión WebP de 640 px usada en la intro.
- La salida espera la decodificación del hero y el logo, además de las fuentes locales; no espera las imágenes lazy. Ante errores se permite continuar. Un límite independiente de 10 segundos evita bloquear el sitio incluso si falla el módulo de animación.
- Sin JavaScript o con movimiento reducido, el contenido se muestra directamente. Mientras la intro está activa, el contenido permanece inerte y se oculta el cursor personalizado; ambos recuperan su comportamiento al finalizar.

## Pendiente para próximas iteraciones

- Validar los textos y datos provenientes de la referencia.
- Incorporar parallax y animaciones.
- Definir el servicio de envío antes de incorporar un formulario. Actualmente se ofrecen enlaces de contacto reales, sin simular envíos.

El build supone publicación en la raíz del dominio. Para una subcarpeta, configurar `base` en Astro y adaptar los enlaces locales antes del despliegue.
