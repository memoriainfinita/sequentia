# Sequentia — CLAUDE.md

Aplicación web de escritorio para crear slideshows de video a partir de imágenes locales. Funciona 100% en el navegador, sin servidor.

## Arquitectura

- **Stack:** HTML + CSS + JavaScript vanilla — sin frameworks, sin build system, sin npm
- **Entrega:** archivo `.html` único autocontenido (estilos y scripts inline; Google Fonts y Mediabunny vía CDN ESM)
- **Motor de exportación:** WebCodecs API + Mediabunny — Chrome/Edge modernos, en Web Worker con OffscreenCanvas
- **Persistencia:** IndexedDB para proyecto y blobs de imagen; localStorage solo para preferencias de UI
- **Serverless:** abre desde `file://` o hosting estático sin servidor

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
--green:   #22c55e   /* estados positivos */
--red:     #ef4444   /* errores */
--mono:    'IBM Plex Mono', monospace
--sans:    'IBM Plex Sans', system-ui, sans-serif
```

### Tipografía
- Interfaz general: `--sans`
- Tiempos, contadores, datos técnicos: `--mono`
- Texto de overlay en slides: Inter, Playfair Display, Montserrat, Oswald, Lato (Google Fonts)

## Reglas de Implementación

- No usar React, Vue, Svelte ni ningún framework
- No usar npm ni node_modules
- No introducir un sistema de build (webpack, vite, etc.)
- No dividir en múltiples archivos sin pedirlo explícitamente
- No añadir TypeScript
- No crear archivos de documentación adicionales salvo que se pida
- Imágenes soportadas: solo JPG/JPEG y PNG — otros formatos muestran toast de error
- Botones / features experimentales: comentados en el código, no ocultos con lógica

## Inicio de sesión

Leer `state.md` antes de cualquier acción — contiene el estado actual, decisiones tomadas y el próximo paso.

## Archivos del Proyecto

- `state.md` — estado de sesión y handoff entre sesiones
- `docs/specs/2026-03-28-sequentia-design.md` — spec activa (fuente de verdad de producto)
- `examples/poc1-webcodecs.html` — POC validado del motor WebCodecs (funciona desde file://)
- `.archive/` — spec v1, POCs descartados y assets de referencia (marcos PNG, fondos). Gitignored
