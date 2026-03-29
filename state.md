---
created: 2026-03-28
last_updated: 2026-03-28
version: 1.0
---

# Sequentia — State

## Project

- **Nombre:** Sequentia
- **Tipo:** App web de escritorio, archivo HTML único
- **Ruta:** `SEQUENTIA/`
- **Stack:** HTML + CSS + JS vanilla, sin frameworks, sin build tools
- **Motor de exportación:** WebCodecs API + mp4-muxer
- **Browser requerido para exportar:** Chrome / Edge
- **Serverless:** sí — abre desde `file://` sin servidor

## Spec

- **Activa:** `docs/specs/2026-03-28-sequentia-design.md`
- **Estado:** aprobada, lista para plan de implementación

## Archivos clave

```
state.md                                   ← este archivo
CLAUDE.md                                  ← contexto para Claude Code
docs/specs/2026-03-28-sequentia-design.md  ← spec activa
examples/poc1-webcodecs.html               ← motor validado
examples/frames and backgrounds/           ← assets de referencia
archive/                                   ← spec v1 y POCs descartados
```

## Contexto del Proyecto

Cubre el hueco entre editores de video complejos y herramientas de presentación que no producen video. El workflow debe ser rápido — decenas de imágenes en segundos, resultado profesional.

**No es:** un editor de video, un PowerPoint, una herramienta para presentaciones complejas.

## Transiciones acordadas (7)

Fade · Slide (4 dir) · Zoom Punch · Wipe (4 dir) · Cross-Zoom (velocidad slider) · Flash (color picker) · Random (pool de todas)

## Preferences

- Sesiones cortas para no agotar el contexto
- state.md como único mecanismo de handoff entre sesiones
- Vibe coding con Claude Code — sin sobreingeniería
- No crear archivos innecesarios, no añadir features no pedidas
- Preguntar todo lo necesario antes de escribir código
- Respuestas concisas, sin resúmenes al final

## Patterns

- Spec aprobada antes de cualquier implementación. Confirmado 2026-03.
- Brainstorming + writing-plans antes de tocar código. Confirmado 2026-03.
- Botones / features experimentales: comentados en el código, no ocultos con lógica. Confirmado 2026-03.
- Ken Burns sin configuración expuesta — efectos automáticos. Confirmado 2026-03.

## History

### 2026-03-29 — Sesión 6: Implementación Task 11
**Hecho:**
- Task 11 (Audio System) completada — sección "Audio" en config panel, `state.config.audio` expandido, `<audio id="audioEl">`, `bindAudioEvents()`, `restoreAudioBlob()`, sync play/pause, loop-on-ended, mute (teclado m/M), blob en IndexedDB, serialización sin blobUrl
- Fixes post-review: resume no resetea posición, `onloadedmetadata` con `{ once: true }`, seek slider max en restore, volume slider save solo en `change`
- `sequentia.html` ahora ~2937 líneas

**Deuda técnica anotada para Task 12:**
- Doble-overlay durante transiciones: los overlays se hornean en cada buffer de slide. Fix: `drawSlide` debe aceptar `{skipOverlays: true}` y `drawTransition` llamar `drawGlobalOverlays` una vez sobre el canvas compuesto final.

**Próximo paso:** Continuar con Task 12 (Export Engine)

---

### 2026-03-28 — Sesión 5: Implementación Tasks 9–10
**Hecho:**
- Task 9 (Text Overlays) completada — `drawTextOverlay`, `buildTextControls` reutilizable, sección "Texto Global", toggle Heredar/Propio/Sin texto por slide, drag en canvas
- Task 10 (Global Overlays) completada — `drawGlobalOverlays`, sección "Overlays Globales", watermark + frame + vignette, drag watermark, `setupCanvasDrag` con `dragMode`, `restoreOverlayImages`
- `sequentia.html` ahora ~2650 líneas

---

### 2026-03-28 — Sesión 3: Implementación Tasks 1–8
**Hecho:**
- Tasks 1–8 completadas con subagent-driven-development (implementer + spec review + quality review por task)
- `sequentia.html` creado y funcional con: HTML shell, CSS design system, IndexedDB, state, thumbnails, canvas preview, playback controls + atajos, 7 transiciones, paneles de configuración (Canvas/Fondo/Timing/Transiciones/Exportación), override panel por slide
- Fixes aplicados: export button state (WebCodecs), slideDuration estimate, preset apply sin rebuild, override panel persiste abierto tras renderThumbs

---

### 2026-03-28 — Sesión 2: Auditoría + Plan de implementación
**Hecho:**
- 6 agentes lanzados en paralelo: 3 de auditoría de spec (UX, técnico, consistencia) + 3 de investigación web (WebCodecs, audio, persistencia)
- Spec actualizada a v2.1 con todos los hallazgos aplicados
- CLAUDE.md adelgazado (de 88 a 50 líneas — solo lo que Claude necesita para codear)
- Plan de implementación creado: `docs/superpowers/plans/2026-03-28-sequentia-app.md`

**Decisiones tomadas esta sesión:**
- Mediabunny sustituye a mp4-muxer (deprecada por el autor)
- IndexedDB para proyecto y blobs; localStorage solo para prefs de UI
- Export JSON = solo metadatos (sin imágenes)
- Web Worker + OffscreenCanvas para exportación
- Ken Burns eliminado → 7 transiciones
- Duración de transición = adicional a la del slide
- Texto overlay con toggle Heredar global / Texto propio / Sin texto
- Posiciones de overlays en coordenadas normalizadas 0.0–1.0
- EXIF: `createImageBitmap(blob, { imageOrientation: 'from-image' })`
- Sin cola de exportación — botón único con cancel

**Próximo paso:** empezar la implementación con `superpowers:subagent-driven-development` (o inline) siguiendo el plan. Empezar por Task 1.

### 2026-03-28 — Sesión de arranque del proyecto
**Hecho:**
- Revisados POC1 (WebCodecs, funciona) y POC2 (ffmpeg.wasm, bug crítico + descartado)
- Decisión: WebCodecs-only, serverless, sin ffmpeg.wasm
- Spec v1 revisada y reescrita como v2 (aprobada)
- Archivos reorganizados: spec v1 y POCs ffmpeg a `archive/`, POC1 a `examples/`

**Cambios principales en spec:**
- ffmpeg.wasm eliminado (requería servidor)
- Cola de exportación → botón Dev comentado en código
- Ken Burns simplificado (sin config)
- Cover forzado eliminado (blur 0% = cover)
- Fondo personalizado añadido (imagen propia + blur)
- Toast de exportación con tamaño y tiempo
- 720p/1080p únicamente, MP4 únicamente

## TODO

- [x] Crear plan de implementación con `superpowers:writing-plans`
- [ ] Implementar app principal — ver `docs/superpowers/plans/2026-03-28-sequentia-app.md`
  - [x] Task 1: HTML Shell + CSS Design System
  - [x] Task 2: IndexedDB Storage Layer
  - [x] Task 3: Image Loading + Thumbnail Panel
  - [x] Task 4: Canvas Preview Engine
  - [x] Task 5: Playback Controls + Keyboard Shortcuts
  - [x] Task 6: Transitions (7)
  - [x] Task 7: Configuration Panels
  - [x] Task 8: Slide Override Panel
  - [x] Task 9: Text Overlays
  - [x] Task 10: Global Overlays (Watermark, Frame, Vignette)
  - [x] Task 11: Audio System
  - [ ] Task 12: Export Engine (WebCodecs + Mediabunny)
  - [ ] Task 13: Persistence (Autosave + JSON)
  - [ ] Task 14: Undo / Redo Stack
  - [ ] Task 15: Fullscreen Presentation Mode
  - [ ] Task 16: Polish + Edge Cases
- [ ] Definir bitrates exactos para presets Bajo/Medio/Alto al llegar al motor de exportación
- [ ] Botón Dev (exportar todas las combinaciones) — comentado hasta que haga falta

## Decisiones de arquitectura (post-auditoría 2026-03-28)

- **Muxer:** Mediabunny (sucesor activo de mp4-muxer, mismo autor, ESM CDN)
- **Persistencia:** IndexedDB para proyecto y blobs; localStorage solo para prefs de UI
- **Export JSON:** solo metadatos, sin imágenes. Backup completo = ZIP via JSZip CDN
- **Exportación:** Web Worker + OffscreenCanvas para no bloquear UI
- **Ken Burns:** eliminado. 7 transiciones en total
- **Animaciones de exportación:** siempre `t` normalizado desde `frameIndex/fps`, nunca `Date.now()`
- **Posiciones de overlays:** coordenadas normalizadas 0.0–1.0
- **Duración de transición:** adicional a la del slide (no consumida)
- **Texto overlay:** toggle Heredar global / Texto propio / Sin texto
- **EXIF:** rotar antes de pasar al canvas/encoder
