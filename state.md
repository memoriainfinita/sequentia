---
created: 2026-03-28
last_updated: 2026-03-31
version: 1.0
---

# Sequentia — State

## Project

- **Nombre:** Sequentia
- **Tipo:** App web de escritorio, archivo HTML único
- **Ruta:** `SEQUENTIA/`
- **Stack:** HTML + CSS + JS vanilla, sin frameworks, sin build tools
- **Motor de exportación:** WebCodecs API + Mediabunny
- **Browser requerido para exportar:** Chrome / Edge
- **Serverless:** sí — abre desde `file://` sin servidor

## Spec

- **Activa:** `docs/specs/2026-03-28-sequentia-design.md`
- **Estado:** implementación completa (Tasks 1-16 + audit + fixes)

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

### 2026-03-31 — Sesión 14: UX + preview redimensionable

**Hecho:**
- Loop eliminado del header (solo en playControls)
- Miniaturas: `height: 72px; flex-shrink: 0` — ya no se encogen con muchas imágenes
- Botón "Ir al inicio" (⏮) añadido en controles normales y overlay fullscreen; `btnFirst`/`fsoFirst` deshabilitado en slide 0
- Prev/Next cambiados a ← → para no confundir con play (▶)
- Preview redimensionable: drag handle entre preview y config, rango 20%-75%, persiste en localStorage; `updateCanvasSize()` llamado durante el drag con reflow forzado
- `maxH` en `updateCanvasSize` descuenta altura de `#playControls` para ratio correcto
- Valor guardado en localStorage se aplica al cargar con reflow + `updateCanvasSize()` inmediato
- Wipe left/right intercambiados: corregido en `transitionWipe` y `transitionWipeW`
- Badge `#canvasInfo` oculto al entrar en fullscreen, restaurado al salir

**Próximo paso:** bugs funcionales — CORS Mediabunny (crítico), blur, fondo personalizado, seek audio, preset prompt.

---

### 2026-03-31 — Sesión 13: Fixes de prueba manual

**Hecho:**
- Fix CORS audio `file://`: auto fade-out cuando audio > video en export (`applyAudioSettings`)
- Fix `renderThumbs`: reemplazado `list.innerHTML = ''` por eliminación selectiva → `#emptyState` ya no se destruye del DOM → el borrado de slides funciona
- Fix `addImages()`: añadidos `updateEmptyState()` y `updatePlayControls()` → el canvas vacío desaparece y los controles se activan al cargar imágenes
- Fix `removeSlide()`: añadidos `renderFrame()`, `updateEmptyState()`, `updatePlayControls()`
- Reemplazados todos los `confirm()` y `prompt()` nativos por modal `showConfirm()` personalizado (CSS coherente con design system)

**Próximo paso:** bugs y ajustes listados en TODO de esta sesión. Empezar por el CORS de Mediabunny (bloquea exportación).

---

### 2026-03-30 — Sesión 12: Audit completo + fixes
**Hecho:**
- Audit paralelo de todas las Tasks 1-16 con 7 agentes — 10 issues encontrados
- Tasks 6-7-8-9-10-11-12-15: sin issues
- 10 fixes aplicados y verificados:

| Fix | Issue |
|-----|-------|
| A1 | `updateCanvasSize()` ahora setea `canvas.style.width/height` en path normal |
| A2 | `drawSlide()` usa `cfg._bgBitmap` cuando `bgImageId` está set; listener crea bitmap; export lo transfiere |
| A3 | Reemplazar imagen: `slide._bitmap` se actualiza correctamente, `blobUrl` se revoca y renueva |
| A4 | `removeSlide()` difiere borrado de IndexedDB con `_pendingBlobDeletes` Set; `pushUndo()` purga cuando ya no recuperable |
| M1 | `TRANSITIONS_LIST` incluye `'random'` — tecla T ahora cicla hasta Random |
| M2 | Delete/Backspace elimina slide seleccionado (con confirm si tiene overrides) |
| M3 | `removeSlide()` llama `updateExportEstimate()` |
| M4 | Badge baja resolución usa `getCanvasDimensions()` — correcto para todos los aspect ratios |
| B1 | `DB_NAME`/`DB_VERSION` como constantes nombradas |
| B2 | `fileInput` movido dentro de `.panel-footer` en `#panelRight` |

**Próximo paso:** prueba manual desde `file://` con Chrome — app lista.

---

### 2026-03-30 — Sesión 11: Implementación Task 16
**Hecho:**
- Task 16 (Polish + Edge Cases) completada
- Casi todo estaba implementado en sesiones anteriores; los cambios de esta sesión:
  - `cycleTransition()` corregida: ahora actualiza pills de `#pillTransition`, llama `updateTransitionOpts()`, `pushUndo()` y `debouncedSave()`
  - Dev button comentado añadido en `header-right`: `<!-- DEV: ... <button id="btnDevExport"> -->`
  - `checkWebCodecsSupport()`: añadido `btn.title` con mensaje de tooltip cuando WebCodecs no está disponible
- `sequentia.html` ahora ~4035 líneas
- Implementación completa — todas las Tasks 1-16 terminadas

**Estado de la app (verificado por spec review):**
- Indicador Live/Recording ✅
- Badge baja resolución ✅
- Orden de carga (localeCompare) ✅
- EXIF orientation ✅
- Estado vacío (canvas + controls deshabilitados) ✅
- Confirmación delete con overrides ✅
- Toasts (success/error/info) ✅
- Estimación peso exportación ✅
- checkWebCodecsSupport + tooltip ✅
- Guard atajos en inputs ✅
- Presets validados con × delete ✅
- Tecla T global ✅
- Botón Dev comentado ✅

**Próximo paso:** Prueba manual desde `file://` con Chrome según checklist de Task 16. App lista para uso.

---

### 2026-03-29 — Sesión 10: Implementación Task 15
**Hecho:**
- Task 15 (Fullscreen Presentation Mode) completada — `#fullscreenOverlay` en `#previewWrap`, CSS con auto-hide (opacity/pointer-events), `_enterFullscreenUI`/`_exitFullscreenUI`, `_showFsOverlay`/`_hideFsOverlay` con timer 3s, `_onFsMouseMove` attached/detached en enter/exit, `fullscreenchange` para Escape, botones fsoPrev/fsoPlay/fsoNext/fsoExit, `updatePlayControls()` sincroniza fsoPlay/fsoCounter/fsoProgressBar
- Fixes quality review: guard fullscreen en `updateCanvasSize()`, `clearTimeout` en `_hideFsOverlay`, mousemove attach/detach en lugar de listener permanente
- Audio continúa sin interrupción (enter/exit UI no toca `<audio>`)
- `sequentia.html` ahora ~3960 líneas

**Próximo paso:** Task 16 (Polish + Edge Cases)

---

### 2026-03-29 — Sesión 9: Implementación Task 14
**Hecho:**
- Task 14 (Undo/Redo) completada — `undoStack`/`redoStack` (máx 50), `pushUndo()`, `undo()`/`redo()` async, `applyStateSnapshot()` async con blob cache + IndexedDB recovery para slides borrados
- `buildTextControls` refactorizado con `onCommit` separado de `onChange` (input → preview, change → commit)
- Sliders/color pickers: `pushUndo()` solo en `change`, no en `input`
- `buildConfigPanels()` llamado en `applyStateSnapshot` para sincronizar UI
- Atajos: Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y
- Fixes de quality review: audio null fallback, await en undo/redo, recuperación blobs IndexedDB

**Próximo paso:** Task 15 (Fullscreen Presentation Mode)

---

### 2026-03-29 — Sesión 8: Implementación Task 13
**Hecho:**
- Task 13 (Persistence) completada — `debouncedSave()` 500ms, `loadAndRestoreProject()` con restore completo de slides/blobs/overlays/audio desde IndexedDB, `deserializeState()` para import JSON, `btnExportJSON` + `btnImportJSON` con confirm dialog, placeholder `_missing: true` en thumbnails
- Fixes de quality review: return value en `loadAndRestoreProject` para evitar double-call leak, eliminado `await` falso en `debouncedSave`, `updateExportEstimate()` en `deserializeState`, try/catch en startup restore
- `sequentia.html` ahora ~3820 líneas

**Deuda técnica:**
- Doble-overlay durante transiciones (heredada de Task 12): worker aplica overlays en cada buffer antes de componer. Fix pendiente.

**Próximo paso:** Task 14 (Undo / Redo Stack)

---

### 2026-03-29 — Sesión 7: Implementación Tasks 11–12
**Hecho:**
- Task 11 (Audio System) completada — sección "Audio" en config panel, `state.config.audio`, `<audio id="audioEl">`, `bindAudioEvents`, `restoreAudioBlob`, sync play/pause, loop, mute (m/M), IndexedDB, serialización sin blobUrl
- Task 12 (Export Engine) completada — Web Worker en `<script type="text/plain" id="worker-src">`, Mediabunny muxer, WebCodecs VideoEncoder + AudioEncoder, OffscreenCanvas rendering
- Funciones main-thread: `startExport`, `prepareExportPayload`, `applyAudioSettings`, `downloadMP4`, `resetExportButton`, `playCompletionSound`
- Worker: `runExport`, `encodeFrame`, `encodeAudio`, `renderSlideWorker`, `drawSlideWorker`, `drawGlobalOverlaysWorker`, `drawTextOverlayWorker`, 6 transiciones worker-side
- `sequentia.html` ahora ~3620 líneas

**Deuda técnica:**
- Doble-overlay durante transiciones: worker aplica overlays en cada slide buffer antes de componer. Fix pendiente: `drawSlideWorker` con `{skipOverlays}` + `drawGlobalOverlaysWorker` post-composición.

**Próximo paso:** Task 13 (Persistence — Autosave + JSON export/import)

---

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
- [x] Implementar app principal — Tasks 1-16 completas
- [x] Botón Dev (exportar todas las combinaciones) — comentado en el HTML

### Bugs y ajustes pendientes (detectados en prueba manual 2026-03-31)

**Crítico (bloquea uso)**
- [ ] **CORS Mediabunny en file://** — El worker usa `importScripts('https://cdn...')` que falla desde `file://` con CORS/MIME error. Solución: fetch mediabunny en main thread → pasar código como string al worker, o bundlear inline en el HTML. Sin esto la exportación no funciona.

**Bugs funcionales**
- [ ] **Blur: salto al pasar de 0 a 1** — En `drawSlide()`, cuando `bgBlur` pasa de 0 a cualquier valor > 0, la lógica de renderizado cambia bruscamente (cover sin blur vs blur con padding 10%). La imagen da un salto visible. Unificar el path de renderizado para que sea continuo.
- [ ] **Fondo personalizado no se aplica** — Cuando hay imagen de fondo personalizada (`bgImageId` set) o color sólido, se sigue mostrando la imagen del slide repetida como fondo. Bug en `drawSlide()` — revisar la lógica de selección: si `bgImageId` → usar imagen personalizada; si no → blur del slide; `bgColor` siempre como capa base.
- [x] **Transición Wipe left/right intercambiadas** — corregido en `transitionWipe` y `transitionWipeW`: left ahora entra desde la derecha, right desde la izquierda.
- [ ] **Seek de audio no se mueve durante reproducción** — El slider `#audioSeek` no tiene listener `timeupdate` → no refleja la posición actual. Añadir: `audioEl.addEventListener('timeupdate', () => { seekSlider.value = audioEl.currentTime; })`. También debe respetar trimIn/trimOut como rango del slider.
- [ ] **Preset guardar lanza prompt() nativo** — `prompt('Nombre del preset:')` → reemplazar con modal personalizado (igual que `confirm()` → `showConfirm()`). Añadir `showPrompt(msg)` que devuelve Promise<string|null>.
- [x] **Fullscreen: info de resolución no se oculta** — `#canvasInfo` ahora se oculta en `_enterFullscreenUI` y se restaura en `_exitFullscreenUI`.

**Ajustes de UX**
- [x] **Fullscreen: falta botón reiniciar (ir al principio)** — Añadido `btnFirst`/`fsoFirst` (⏮) en controles normales y fullscreen. Prev/Next cambiados a ← →.
- [x] **Panel derecho: miniaturas no deben redimensionarse** — `.thumb` ahora tiene `height: 72px; flex-shrink: 0`.
- [x] **Header: quitar toggle Loop** — Eliminado del header, solo queda en `#playControls`.

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
