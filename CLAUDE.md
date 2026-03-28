# Sequentia — CLAUDE.md

Aplicación web de escritorio para crear slideshows de video a partir de imágenes locales. Funciona 100% en el navegador, sin servidor.

## Arquitectura

- **Stack:** HTML + CSS + JavaScript vanilla — sin frameworks, sin build system, sin npm
- **Entrega:** archivos `.html` autocontenidos (todo inline: estilos, scripts, sin dependencias externas salvo Google Fonts y libs CDN)
- **Motor de exportación primario:** WebCodecs API + mp4-muxer (Chrome/Edge modernos, hardware-accelerated)
- **Motor de exportación fallback:** ffmpeg.wasm (Firefox/Safari — requiere headers COOP/COEP)
- **Persistencia:** localStorage únicamente (un proyecto, el último activo)

## Design System

### Tokens CSS (usar siempre estas variables, nunca valores hardcoded)
```css
--bg:      #09090b   /* fondo principal Zinc-950 */
--s1:      #111113   /* superficie nivel 1 */
--s2:      #18181b   /* superficie nivel 2 / paneles */
--s3:      #27272a   /* superficie nivel 3 */
--border:  #2e2e32   /* bordes 1px */
--text:    #fafafa   /* texto primario */
--muted:   #71717a   /* texto secundario */
--accent:  #f97316   /* naranja — acciones primarias, selección activa */
--accent2: #fb923c   /* naranja suave — hover */
--green:   #22c55e   /* estados positivos / compatibilidad OK */
--red:     #ef4444   /* errores / incompatibilidad */
--mono:    'IBM Plex Mono', monospace
--sans:    'IBM Plex Sans', system-ui, sans-serif
```

### Tipografía
- Interfaz general: `--sans` (IBM Plex Sans)
- Datos técnicos, tiempos, contadores, etiquetas numéricas: `--mono` (IBM Plex Mono)
- Texto de overlay en slides: Inter, Playfair Display, Montserrat, Oswald, Lato (Google Fonts)

### Efectos
- Bordes: 1px `var(--border)`
- Glassmorphism en paneles flotantes: `backdrop-filter: blur()`
- Animaciones en hover/drag/transiciones de panel
- Slide seleccionado en panel lateral: borde naranja 2px

## Estructura de UI

Tres áreas permanentes:
1. **Header** — nombre, botón Exportar (se convierte en barra de progreso durante exportación), indicador "En Vivo / Grabando", toggle Loop, export/import JSON
2. **Panel central** — canvas de preview + controles de reproducción + panel de configuración con secciones colapsables (Canvas, Fondo, Timing, Transiciones, Exportación, Overlays Globales, Audio)
3. **Panel lateral derecho** — lista vertical de miniaturas con overrides inline por slide

## Reglas de Implementación

### Lo que NO hacer
- No usar React, Vue, Svelte ni ningún framework
- No usar npm ni node_modules
- No introducir un sistema de build (webpack, vite, etc.)
- No dividir en múltiples archivos sin pedirlo explícitamente
- No añadir TypeScript
- No crear archivos de documentación adicionales salvo que se pida

### Imágenes soportadas
Solo JPG/JPEG y PNG. Cualquier otro formato (WebP, HEIC, AVIF, GIF) debe mostrar un toast de error.

### Transiciones disponibles (exactamente estas 8)
1. Fade, 2. Slide (4 direcciones), 3. Ken Burns (pan + zoom configurable),
4. Zoom Punch (in & out), 5. Wipe (4 direcciones), 6. Cross-Zoom (velocidad slider),
7. Flash (color elegible), 8. Random

### Atajos de teclado
`←/→` slide anterior/siguiente, `Space` play/pause, `F` fullscreen, `Escape` salir fullscreen, `R` reiniciar, `M` mute, `T` cicla transiciones

### Panel de override por slide
Se expande inline bajo la miniatura. Contiene: duración individual, transición individual + dirección + duración, título/subtítulo de texto, botón "eliminar todos los overrides".

### Cola de exportación
No bloquea la UI. Cada trabajo es un snapshot inmutable del estado en el momento de añadirse. FIFO. Toast por trabajo completado, sonido al vaciar la cola, toast de error con reintento.

## Inicio de sesión

Leer `state.md` antes de cualquier acción — contiene el estado actual, decisiones tomadas y el próximo paso.

## Archivos del Proyecto

- `state.md` — estado de sesión y handoff entre sesiones
- `docs/specs/2026-03-28-sequentia-design.md` — spec activa (fuente de verdad)
- `examples/poc1-webcodecs.html` — POC validado del motor WebCodecs (funciona desde file://)
- `examples/frames and backgrounds/` — assets de referencia (marcos PNG, fondos)
- `archive/` — spec v1 y POCs de ffmpeg.wasm (descartados)
