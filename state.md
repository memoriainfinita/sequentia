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

## Transiciones acordadas

Fade · Slide (4 dir) · Ken Burns (automático, sin config) · Zoom Punch · Wipe (4 dir) · Cross-Zoom (velocidad slider) · Flash (color picker) · Random (pool de todas)

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

- [ ] Crear plan de implementación con `superpowers:writing-plans`
- [ ] Implementar app principal
- [ ] Definir bitrates exactos para presets Bajo/Medio/Alto al llegar al motor de exportación
- [ ] Botón Dev (exportar todas las combinaciones) — comentado hasta que haga falta
