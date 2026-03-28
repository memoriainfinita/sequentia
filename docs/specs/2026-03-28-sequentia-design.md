# Sequentia — Spec de Producto

> Versión 2.0 — Revisada y aprobada en sesión de diseño

---

## 1. Concepto y Stack

Aplicación web de escritorio para crear slideshows de video de alta calidad a partir de imágenes locales. Flujo rápido: cargar fotos → ajustar → exportar MP4. Cubre el hueco entre editores de video complejos y herramientas de presentación que no producen video profesional.

**Casos de uso:** uso personal, trabajos para clientes, bodas, espectáculos en directo.

### Stack
- HTML + CSS + JavaScript vanilla — sin frameworks, sin build tools, sin npm
- Archivo HTML único autocontenido (estilos y scripts inline, Google Fonts vía CDN)
- **Motor de exportación:** WebCodecs API + mp4-muxer
- **Requisito de browser:** Chrome o Edge modernos para exportar. Otros browsers pueden usar la app pero ven un aviso claro al intentar exportar
- **100% serverless** — abre directamente desde `file://` o desde cualquier hosting estático

---

## 2. Diseño Visual

**Atmósfera:** "Dark Studio" — profesional, minimalista, técnico.

### Tokens CSS
```css
--bg:      #09090b   /* fondo principal */
--s1:      #111113
--s2:      #18181b
--s3:      #27272a
--border:  #2e2e32
--text:    #fafafa
--muted:   #71717a
--accent:  #f97316   /* naranja — acciones primarias, selección */
--accent2: #fb923c
--green:   #22c55e
--red:     #ef4444
--mono:    'IBM Plex Mono', monospace
--sans:    'IBM Plex Sans', system-ui, sans-serif
```

### Efectos
- Bordes 1px `var(--border)`
- Glassmorphism en paneles flotantes (`backdrop-filter: blur`)
- Animaciones en hover, drag, transiciones de panel
- Slide seleccionado en panel lateral: borde naranja 2px

---

## 3. Estructura de Interfaz

Tres áreas permanentes en escritorio.

### A. Cabecera
- Nombre **Sequentia**
- Botón **Exportar Video** (naranja) → se convierte en barra de progreso con porcentaje durante la exportación
- Al finalizar: descarga automática + toast con nombre del archivo, tamaño y tiempo de exportación + sonido suave
- Toggle **Loop**
- Indicador **En Vivo / Grabando** (círculo parpadeante — verde en preview, naranja exportando)
- Botones **Export JSON** / **Import JSON**

### B. Panel Central

#### Preview
- Canvas con las imágenes y transiciones en tiempo real
- Indica ratio de aspecto y resolución
- Drag & drop de imágenes directamente sobre el canvas

#### Controles de reproducción
- Play / Pause · Slide anterior / Siguiente · Pantalla completa · Toggle Loop
- Contador `3 / 12` en fuente mono

#### Configuración (secciones colapsables)

**Canvas**
- Aspect ratio: 16:9 · 9:16 · 1:1 · 4:3 · 4:5 · 21:9 · Personalizado (W × H)
- Presets personalizados: botón "Guardar como preset" con nombre, sin límite
- Resolución de exportación: 720p / 1080p
- Ajuste de imagen: Contain · Cover · Fit Width · Fit Height

**Fondo** (cuando la imagen no ocupa todo el canvas)
- Blur de imagen del slide actual (slider intensidad 0–100) — a 0% actúa como cover
- Color sólido (color picker)
- Vignette / overlay oscuro (slider opacidad)
- Imagen personalizada de fondo (upload JPG/PNG) + slider de blur (0–100)

**Timing**
- Duración global por slide (segundos, con decimales)
- Duración de transición global (segundos, con decimales)

**Transiciones**
- Selector global con opción Random
- Lista de transiciones: ver sección 4

**Exportación**
- FPS: 24 / 30 / 60
- Calidad: Bajo / Medio / Alto
- Nombre del archivo (input editable)
- Indicador de compatibilidad: punto verde/rojo según soporte del browser actual
- Estimación en tiempo real del peso del archivo resultante

**Overlays Globales**
- Marca de agua PNG: posicionamiento libre por drag sobre preview, escala (slider), opacidad (slider)
- Marco PNG transparente superpuesto sobre todo el canvas, opacidad (slider)
- Vignette global: intensidad (slider), color (negro por defecto)

**Audio** *(no crítico)*
- Un track de audio por proyecto (MP3, WAV, OGG)
- Barra de seek (para preview — independiente de la exportación)
- Trim In / Trim Out (sliders/inputs numéricos independientes)
- Volumen (slider 0–100%)
- Fade In automático (toggle + duración en segundos)
- Fade Out automático al final (toggle + duración)
- Loop: si el audio entre Trim In/Out es más corto que el video, hace loop
- Si el audio es más largo que el video: Fade Out automático al acabar el último slide

### C. Panel Lateral Derecho

#### Lista de slides
- Miniaturas verticales de todas las imágenes
- Estado vacío: zona de drop con instrucciones visuales

#### Información por miniatura
- Número de orden (mono)
- Badge de duración si tiene override
- Icono de transición si tiene override
- Badge de baja resolución (icono informativo — solo si imagen < resolución de exportación elegida)

#### Interacción
- Click → salta al slide en preview, se marca como seleccionado (borde naranja 2px)
- Drag & drop para reordenar (estilo Notion: miniatura semitransparente, gap donde va a caer)
- Click derecho → "Reemplazar imagen" (mantiene todos los overrides)
- Delete/Backspace → elimina slide. Si tiene overrides: diálogo de confirmación
- Drop de múltiples archivos → se añaden al final en orden del sistema de archivos

#### Panel de override inline por slide
Se expande bajo la miniatura al hacer click en icono de edición:
- Duración individual
- Transición individual + dirección + duración
- Título / subtítulo de texto (ver sección 5)
- Botón "Eliminar todos los overrides"

#### Botones del panel
- Añadir imágenes (selector múltiple)
- Papelera por miniatura

---

## 4. Transiciones

| Transición | Configuración |
|---|---|
| **Fade** | — |
| **Slide** | Dirección: izquierda / derecha / arriba / abajo |
| **Ken Burns** | Sin configuración — zoom suave + pan aleatorio automático |
| **Zoom Punch** | — (zoom in de entrada y zoom out de salida) |
| **Wipe** | Dirección: izquierda / derecha / arriba / abajo |
| **Cross-Zoom** | Velocidad (slider) |
| **Flash** | Color (picker, blanco por defecto) |
| **Random** | Pool de todas las anteriores, una aleatoria por transición |

Tecla **T** cicla por los modos en orden: Fade → Slide → Ken Burns → Zoom Punch → Wipe → Cross-Zoom → Flash → Random → Fade…

---

## 5. Overlays de Texto

### Texto global
Plantilla base que se aplica a todos los slides. Los slides con texto propio lo ignoran.

### Texto por slide (override)
Campo vacío = sin texto en ese slide (desactiva también el global para ese slide).

### Controles (compartidos global y por slide)
- Título (input) + Subtítulo (input, opcional)
- Fuente: Inter · Playfair Display · Montserrat · Oswald · Lato
- Tamaño (slider o input numérico)
- Color (color picker) + Opacidad (slider)
- Posición: libre por drag sobre el preview
- Fondo del texto: ninguno / pill / barra horizontal semitransparente (con opacidad)
- Animación de entrada: Fade In / Slide Up / Ninguna
- Duración visible (segundos — puede ser menor que la duración del slide)

---

## 6. Modo Presentación (Pantalla Completa)

Útil para espectáculos en directo y revisión del resultado.

- Activar: botón en controles del preview o tecla **F**
- Interfaz desaparece, solo las imágenes a pantalla completa con autoplay
- Overlay al mover el ratón (desaparece a 3s de inactividad):
  - Prev / Play-Pause / Next · Contador `3 / 12` · Barra de progreso · Botón salir

### Atajos de teclado

| Tecla | Acción |
|---|---|
| `←` / `→` | Slide anterior / siguiente |
| `Espacio` | Play / Pause |
| `F` | Entrar / Salir pantalla completa |
| `Escape` | Salir de pantalla completa |
| `R` | Reiniciar desde el principio |
| `M` | Mute / Unmute |
| `T` | Ciclar transiciones |

---

## 7. Motor de Exportación

**WebCodecs API + mp4-muxer** — hardware-accelerated, hasta 10× más rápido que tiempo real.

- Requiere Chrome / Edge modernos
- Otros browsers: aviso claro "La exportación requiere Chrome o Edge" — el resto de la app funciona
- Sin fallback ffmpeg.wasm (eliminado — requería servidor HTTP, incompatible con el requisito serverless)

### Parámetros
- Resolución: 720p / 1080p
- FPS: 24 / 30 / 60
- Calidad: Bajo / Medio / Alto (bitrates predefinidos)
- Formato: MP4 únicamente
- Nombre de archivo: editable

### Estimación de peso
Calculada en tiempo real según resolución, FPS y calidad seleccionados.

### Botón Dev (comentado en el código)
```js
// DEV: exporta todas las combinaciones (720p/1080p × 24/30/60fps) para QA
// Descomentar para activar
// document.getElementById('btnDevExport').style.display = ''
```
Cuando está activo: exporta secuencialmente todas las combinaciones predefinidas. Útil para validar que todos los parámetros producen video correcto.

---

## 8. Gestión del Proyecto

- **Autosave en localStorage** — continuo, un proyecto activo
- **Export / Import JSON** — exporta el estado completo del proyecto como `.json`. Al importar: diálogo de confirmación
- **Undo / Redo** — Ctrl+Z / Ctrl+Shift+Z · Stack de 50 operaciones
  - Aplica a: reordenación, eliminación, adición de slides, cambios de configuración

---

## 9. Imágenes

**Formatos soportados:** JPG / JPEG / PNG únicamente.
Otros formatos (WebP, HEIC, AVIF, GIF): toast de error con el formato rechazado.

**Carga:** drag & drop (panel lateral o canvas) · botón "Añadir imágenes" · múltiples a la vez
**Reemplazar:** click derecho → mantiene todos los overrides del slide
**Eliminar:** papelera o Delete/Backspace · confirmación si hay overrides

---

## 10. Plataforma

- Optimizada para escritorio (layout horizontal, tres columnas)
- Móvil: fuera de scope
- Requiere Chrome / Edge para exportar; el resto de funciones son independientes del motor

