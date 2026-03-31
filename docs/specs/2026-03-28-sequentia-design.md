# Sequentia — Spec de Producto

> Versión 2.1 — Actualizada tras auditoría técnica y de producto (2026-03-28)

---

## 1. Concepto y Stack

Aplicación web de escritorio para crear slideshows de video de alta calidad a partir de imágenes locales. Flujo rápido: cargar fotos → ajustar → exportar MP4. Cubre el hueco entre editores de video complejos y herramientas de presentación que no producen video profesional.

**Casos de uso:** uso personal, trabajos para clientes, bodas, espectáculos en directo.

### Stack
- HTML + CSS + JavaScript vanilla — sin frameworks, sin build tools, sin npm
- Archivo HTML único autocontenido (estilos y scripts inline, Google Fonts vía CDN)
- **Motor de exportación:** WebCodecs API + Mediabunny (muxer, CDN ESM)
- **Exportación en Worker:** la exportación corre en un Web Worker con OffscreenCanvas — la UI permanece responsive durante todo el proceso
- **Requisito de browser:** Chrome o Edge modernos para exportar. Otros browsers pueden usar la app pero ven un aviso claro al intentar exportar
- **100% serverless** — abre directamente desde `file://` o desde cualquier hosting estático

### Persistencia
- **Datos del proyecto** (metadatos, config): IndexedDB
- **Blobs de imagen** (autosave de sesión): IndexedDB nativo (sin conversión base64)
- **Preferencias de UI** (paneles colapsados, etc.): localStorage
- IndexedDB funciona correctamente desde `file://` en Chrome/Edge

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
- Botón **Exportar Video** (naranja) → durante la exportación se convierte en barra de progreso con porcentaje
  - Click sobre la barra de progreso cancela la exportación (tooltip "Click para cancelar")
  - Al cancelar: toast "Exportación cancelada", botón vuelve a su estado normal
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
- Presets personalizados: botón "Guardar como preset" con nombre, sin límite. Gestión: botón eliminar junto a cada preset, validación de nombre duplicado
- Resolución de exportación: 720p / 1080p
  - "p" indica altura en píxeles: 720p = 720px alto, 1080p = 1080px alto
  - Para aspect ratios no estándar: el ancho se calcula del ratio y se redondea al par más cercano
- Ajuste de imagen: Contain · Cover · Fit Width · Fit Height

**Fondo** (cuando la imagen no ocupa todo el canvas)
- Blur de imagen del slide actual (slider intensidad 0–100)
  - A 0%: imagen de fondo en Cover sin blur (capa independiente de la imagen principal)
  - La imagen principal mantiene su propio ajuste (Contain/Cover/etc.) sobre esta capa
- Color sólido (color picker)
- Imagen personalizada de fondo (upload JPG/PNG) + slider de blur (0–100)
  - Si hay imagen personalizada, se usa en lugar del blur del slide actual

**Timing**
- Duración global por slide (segundos, con decimales)
- Duración de transición global (segundos, con decimales)
- **La duración de transición es adicional a la del slide.** Duración total del video = `N × duración_slide + (N-1) × duración_transición`

**Transiciones**
- Selector global con opción Random
- Lista de transiciones: ver sección 4

**Exportación**
- FPS: 24 / 30 / 60
- Calidad: Bajo / Medio / Alto
- Nombre del archivo (input editable)
- Indicador de compatibilidad: punto verde/rojo según soporte del browser actual
- Estimación del peso del archivo resultante (basada en `bitrate × duración`, ±30% por naturaleza VBR)

**Overlays Globales**
- Marca de agua PNG: posicionamiento libre por drag sobre preview, escala (slider), opacidad (slider)
- Marco PNG transparente superpuesto sobre todo el canvas, opacidad (slider)
- Vignette global: intensidad (slider), color (negro por defecto)
- Las posiciones y escalas se guardan como valores normalizados (0.0–1.0) relativos al canvas lógico. Al cambiar aspect ratio, se mantienen proporcionales

**Audio** *(no crítico)*
- Un track de audio por proyecto (MP3, WAV, OGG)
- Barra de seek (solo para preview — tooltip: "Solo para previsualización. La exportación usa Trim In/Out")
- Trim In / Trim Out (sliders/inputs numéricos independientes)
- Volumen (slider 0–100%)
- Fade In automático (toggle + duración en segundos)
- Fade Out automático al final (toggle + duración en segundos)
- Loop: si el audio entre Trim In/Out es más corto que el video, hace loop volviendo a Trim In
- Si el audio es más largo que el video: Fade Out automático al acabar el último slide, usando la duración del Fade Out configurado (o 1.5s si Fade Out está desactivado)

### C. Panel Lateral Derecho

#### Lista de slides
- Miniaturas verticales de todas las imágenes
- Estado vacío: zona de drop con instrucciones visuales. Canvas muestra placeholder con call to action central. Controles de reproducción deshabilitados

#### Información por miniatura
- Número de orden (mono)
- Badge de duración si tiene override
- Icono de transición si tiene override
- Badge de baja resolución (icono informativo — si la imagen es más pequeña que la resolución de exportación en cualquier eje)

#### Interacción
- Click → salta al slide en preview, se marca como seleccionado (borde naranja 2px)
- Drag & drop para reordenar (estilo Notion: miniatura semitransparente, gap donde va a caer)
- Click derecho → "Reemplazar imagen" (mantiene todos los overrides; badge de resolución se recalcula)
- Delete/Backspace → elimina slide. Si tiene overrides: diálogo de confirmación listando los overrides presentes
- Drop de múltiples archivos → se añaden al final **en orden alfabético por nombre de archivo**

#### Panel de override inline por slide
Se expande bajo la miniatura al hacer click en icono de edición:
- Duración individual
- Transición individual + dirección + duración
- Texto: toggle **Heredar global / Texto propio / Sin texto** (default: Heredar global)
  - "Texto propio": muestra los controles de texto (título, subtítulo, fuente, etc.)
  - "Sin texto": desactiva también el overlay global para este slide
- Botón "Eliminar todos los overrides"

#### Botones del panel
- Añadir imágenes (selector múltiple, orden alfabético por nombre — tooltip informativo)
- Papelera por miniatura

---

## 4. Transiciones

| Transición | Configuración |
|---|---|
| **Fade** | — |
| **Slide** | Dirección: izquierda / derecha / arriba / abajo |
| **Zoom Punch** | — (zoom in de entrada y zoom out de salida) |
| **Wipe** | Dirección: izquierda / derecha / arriba / abajo |
| **Cross-Zoom** | Velocidad (slider) |
| **Flash** | Color (picker, blanco por defecto) |
| **Random** | Pool de todas las anteriores, una aleatoria por transición |

Tecla **T** cicla por los modos en orden: Fade → Slide → Zoom Punch → Wipe → Cross-Zoom → Flash → Random → Fade…

T siempre afecta a la transición global, nunca al override del slide activo.

---

## 5. Overlays de Texto

### Texto global
Plantilla base que se aplica a los slides con toggle en "Heredar global".

### Texto por slide (override)
Toggle por slide: **Heredar global / Texto propio / Sin texto**
- "Heredar global" (default): el slide usa la plantilla global
- "Texto propio": controles independientes para este slide
- "Sin texto": este slide no muestra texto, ignorando también el global

### Controles (compartidos global y por slide)
- Título (input) + Subtítulo (input, opcional)
- Fuente: Inter · Playfair Display · Montserrat · Oswald · Lato
- Tamaño (slider o input numérico)
- Color (color picker) + Opacidad (slider)
- Posición: libre por drag sobre el preview — guardada como coordenadas normalizadas (0.0–1.0) relativas al canvas lógico
- Fondo del texto: ninguno / pill / barra horizontal semitransparente (con opacidad)
- Animación de entrada: Fade In / Slide Up / Ninguna
- Duración visible (segundos — puede ser menor que la duración del slide)

---

## 6. Modo Presentación (Pantalla Completa)

Útil para espectáculos en directo y revisión del resultado.

- Activar: botón en controles del preview o tecla **F**
- Interfaz desaparece, solo las imágenes a pantalla completa con autoplay
- El audio continúa reproduciéndose al entrar y salir. Respeta el estado de mute y volumen actuales
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
| `T` | Ciclar transiciones (global) |

Los atajos solo se activan cuando el foco no está en un input de texto.

---

## 7. Motor de Exportación

**WebCodecs API + Mediabunny** (muxer ESM, CDN) — hardware-accelerated.

- Requiere Chrome / Edge modernos
- Otros browsers: aviso claro "La exportación requiere Chrome o Edge" — el resto de la app funciona
- La exportación corre en un **Web Worker con OffscreenCanvas** — la UI no se bloquea
- Toda lógica de animación usa `t` normalizado calculado desde `frameIndex / fps`, nunca desde `Date.now()`, para garantizar determinismo entre preview y exportación

### Parámetros
- Resolución: 720p / 1080p (ver sección 3B Canvas para definición de "p")
- FPS: 24 / 30 / 60
- Calidad: Bajo / Medio / Alto (bitrates predefinidos — a definir en implementación)
- Formato: MP4 únicamente
- Nombre de archivo: editable

### Audio en exportación
Si hay un track de audio cargado, se incluye en el MP4 mediante `AudioEncoder` (AAC, 44.1kHz), procesando el audio como PCM desde `AudioContext.decodeAudioData()`. Se respetan los valores de Trim In/Out, Fade In/Out, Loop y Volume. Los chunks de audio y video se entregan al muxer intercalados en orden cronológico.

Si no hay audio cargado, el MP4 se exporta sin pista de audio.

### Estimación de peso
Calculada como `bitrate_objetivo × duración_total` antes de exportar. Imprecisión esperada ±30% por VBR. Durante la exportación se muestra el tamaño real acumulado.

### Botón Dev (comentado en el código)
```js
// DEV: exporta todas las combinaciones (720p/1080p × 24/30/60fps) para QA
// Descomentar para activar
// document.getElementById('btnDevExport').style.display = ''
```

---

## 8. Gestión del Proyecto

- **Autosave en IndexedDB** — continuo, un proyecto activo. Los blobs de imagen se almacenan nativamente (sin base64)
- **Export JSON** — exporta únicamente los metadatos del proyecto (timings, transiciones, config, posiciones, texto) como `.json`. Las imágenes se referencian por nombre de archivo, no se incluyen en el JSON
- **Import JSON** — diálogo de confirmación: "Esto reemplazará el proyecto actual. Las imágenes deben estar disponibles en este dispositivo." Slides con imagen ausente muestran placeholder con icono de error (no se eliminan silenciosamente)
- **Undo / Redo** — Ctrl+Z / Ctrl+Shift+Z · Stack de 50 operaciones
  - El stack guarda únicamente estado estructural (timings, transiciones, config, texto) — nunca blobs de imagen
  - Aplica a: reordenación, eliminación, adición de slides, cambios de configuración, posicionamiento de overlays, cambios de audio

---

## 9. Imágenes

**Formatos soportados:** JPG / JPEG / PNG únicamente.
Otros formatos (WebP, HEIC, AVIF, GIF): toast de error con el formato rechazado.

**Orientación EXIF:** si la imagen contiene metadatos de orientación EXIF, se aplica la rotación/transformación antes de pasar el frame al canvas y al encoder.

**Carga:** drag & drop (panel lateral o canvas) · botón "Añadir imágenes" · múltiples a la vez · orden alfabético por nombre de archivo
**Reemplazar:** click derecho → mantiene todos los overrides del slide; badge de resolución se recalcula con la nueva imagen
**Eliminar:** papelera o Delete/Backspace · confirmación si hay overrides, listando qué overrides se perderán

---

## 10. Plataforma

- Optimizada para escritorio (layout horizontal, tres columnas)
- Móvil: fuera de scope
- Requiere Chrome / Edge para exportar; el resto de funciones son independientes del motor
