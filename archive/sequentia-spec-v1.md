# Sequentia — Especificación Completa de Producto

> Versión 1.0 — Documento de referencia para desarrollo  
> Todas las decisiones recogidas en sesión de definición

---

## 1. Concepto General

Aplicación web de escritorio para crear presentaciones de diapositivas (slideshows) de alta calidad a partir de imágenes locales. Permite organizar la secuencia, previsualizar en tiempo real con transiciones, ajustar todos los parámetros de timing y calidad, y exportar un archivo de video final para descargar. Funciona 100% en el navegador, sin servidor.

---

## 2. Estética y Diseño

### Atmósfera
"Dark Studio" — entorno profesional, minimalista y técnico.

### Paleta de Colores
- **Fondo principal:** Zinc-950 (casi negro)
- **Superficies/paneles:** Zinc-900 (gris oscuro)
- **Texto primario:** Blanco
- **Texto secundario:** Gris suave
- **Acento activo / alertas:** Naranja vibrante
- **Estados positivos:** Verde
- **Estados de error/incompatibilidad:** Rojo

### Tipografía
- **Interfaz general:** Fuente sans-serif moderna (Google Fonts — Inter o similar)
- **Datos técnicos, tiempos, etiquetas numéricas:** Fuente monoespaciada (JetBrains Mono o similar)
- **Overlays de texto del usuario (en slides):** Selección de 4-5 fuentes curadas de Google Fonts (ej. Inter, Playfair Display, Montserrat, Oswald, Lato)

### Efectos Visuales
- Bordes muy finos (1px)
- Glassmorphism: transparencias con backdrop-blur en paneles flotantes
- Animaciones fluidas en interacciones (hover, drag, transiciones de panel)
- Sombras sutiles en elementos elevados

---

## 3. Estructura de la Interfaz

La pantalla se divide en tres áreas principales permanentes en escritorio.

### A. Cabecera (Header)
- Nombre de la aplicación: **Sequentia**
- Botón prominente **"Exportar Video"** (acento naranja)
- Durante la exportación: el botón se transforma en **barra de progreso** con porcentaje numérico
- Al finalizar la exportación: **toast de notificación** + **sonido suave** de confirmación, seguido de descarga automática del archivo
- Controles adicionales en header: toggle **Loop**, indicador **"En Vivo / Grabando"** (círculo parpadeante — verde en preview activo, naranja durante exportación), botón **export/import JSON del proyecto**

### B. Panel Central — Preview y Ajustes

#### Área de Previsualización
- Lienzo grande donde se visualizan las imágenes con las transiciones configuradas
- Reproduce en tiempo real con la configuración activa
- Indica el ratio de aspecto y resolución actuales
- Drag & drop de archivos de imagen directamente sobre el canvas para añadir slides

#### Controles de Reproducción (bajo el canvas)
- **Play / Pause**
- **Slide anterior / Slide siguiente**
- **Botón Pantalla Completa**
- **Toggle Loop** (el slideshow vuelve al inicio al terminar o se detiene)
- Indicador de slide actual: `3 / 12` con fuente mono

#### Panel de Configuración (cuadrícula bajo el preview)

Organizado en secciones colapsables:

**Sección: Canvas**
- Selector de **Aspect Ratio** con presets:
  - 16:9 (YouTube, TV)
  - 9:16 (Reels, TikTok, Shorts)
  - 1:1 (Instagram cuadrado)
  - 4:3 (Clásico)
  - 4:5 (Instagram Portrait)
  - 21:9 (Cinemático Ultrawide)
  - Personalizado (input libre W × H en píxeles) + botón **"Guardar como preset"** con input de nombre — el preset queda disponible en la lista para uso futuro. Sin límite de presets guardados.
- Selector de **Resolución de exportación**: 720p / 1080p / 4K
- **Ajuste de imagen dentro del frame** (comportamiento cuando la imagen no tiene el mismo ratio que el canvas):
  - Contain (imagen completa, fondo visible)
  - Cover (recorta para rellenar)
  - Fit Width (ajusta ancho, fondo arriba/abajo)
  - Fit Height (ajusta alto, fondo a los lados)

**Sección: Fondo (cuando la imagen no ocupa todo el canvas)**
- **Tipo de fondo:**
  - Blur de la imagen (blurred background): slider de intensidad (0–100)
  - Color sólido: color picker
  - Vignette / overlay oscuro: slider de opacidad
  - Ampliar imagen para cubrir (Cover forzado con las 4 opciones de fit)
- Los controles se muestran u ocultan según el tipo seleccionado

**Sección: Timing**
- **Duración global por slide** (segundos, con decimales)
- **Duración de transición global** (segundos, con decimales)

**Sección: Transiciones**
- Selector de transición global con opción **Random**
- Transiciones disponibles:
  1. **Fade** — dissolve suave
  2. **Slide** — desplazamiento (dirección: izquierda, derecha, arriba, abajo)
  3. **Ken Burns** — zoom lento + pan (dirección del pan: aleatoria o configurable: izq/der/arriba/abajo; **intensidad del zoom: slider configurable por el usuario con valores mínimo y máximo**)
  4. **Zoom Punch** — zoom rápido de entrada y de salida (in & out)
  5. **Wipe** — cortinilla (dirección: izquierda, derecha, arriba, abajo)
  6. **Cross-Zoom** — zoom cruzado entre slides (velocidad configurable con slider)
  7. **Flash** — destello (color elegible por el usuario: blanco por defecto)
  8. **Random** — mezcla aleatoria de todas las anteriores en cada transición
- Tecla **T** (en modo presentación) cicla por los modos de transición

**Sección: Exportación de Video**
- **FPS:** 24 / 30 / 60
- **Bitrate:** presets (Bajo / Medio / Alto) + valor manual en Mbps
- **Formato de salida:** MP4 / WebM
- **Nombre del archivo de salida** (input de texto editable)
- **Indicadores de compatibilidad:** puntos de color verde/rojo que indican si el formato/codec seleccionado es compatible con el navegador actual
- **Estimación en tiempo real** del peso aproximado del archivo resultante

**Sección: Overlays Globales**
- **Marca de agua / Logo:**
  - Subir imagen PNG (con canal alpha/transparencia)
  - **Posicionamiento libre:** el usuario arrastra el watermark directamente sobre el preview para colocarlo en cualquier posición del canvas
  - Escala (slider)
  - Opacidad (slider)
- **Frame / Marco decorativo:**
  - Subir imagen PNG transparente que se superpone sobre todo el canvas (estilo marco fotográfico)
  - Opacidad (slider)
- **Vignette global:**
  - Intensidad (slider 0–100)
  - Color del vignette (negro por defecto)

**Sección: Audio**
- Botón para cargar archivo de audio (MP3, WAV, OGG) — un solo track de audio por proyecto
- **Barra de seek** (slider de posición de reproducción en el preview — no afecta a la exportación)
- **Trim In** (slider o input numérico): punto de inicio del audio en la exportación
- **Trim Out** (slider o input numérico): punto de fin del audio en la exportación
- Seek, Trim In y Trim Out son controles completamente independientes
- **Volumen** (slider 0–100%)
- **Fade In automático** al inicio (toggle + duración en segundos)
- **Fade Out automático** al final del video (toggle + duración en segundos)
- **Loop:** si el audio entre Trim In y Trim Out es más corto que el video, hace loop automáticamente
- Comportamiento si el audio es más largo que el video: **Fade Out automático** al acabar el último slide

### C. Panel Lateral Derecho — Gestor de Contenido

#### Lista de Slides
- Columna vertical con miniaturas de todas las imágenes cargadas
- Estado vacío: zona de drop con instrucciones visuales ("Arrastra tus imágenes aquí")

#### Información visible en cada miniatura
- **Número de orden** (fuente mono)
- **Badge de duración individual** si tiene override (ej. `5s`)
- **Icono de transición** si tiene override de transición
- **Badge de baja resolución** (advertencia visible solo como icono informativo en la miniatura — no bloquea ninguna acción): se activa cuando la imagen nativa es más pequeña que la resolución de exportación seleccionada actualmente. Es únicamente informativo para que el usuario decida si quiere sustituirla.

#### Interacción con miniaturas
- **Click:** salta a ese slide en el preview y lo marca como seleccionado
- **Drag & Drop:** reordenar slides — estilo Notion/Figma: la miniatura arrastrada sigue al cursor semitransparente, las demás se desplazan mostrando un gap donde va a caer
- **Click derecho:** menú contextual con opción "Reemplazar imagen" (abre selector de archivo)
- **Tecla Delete/Backspace:** elimina el slide seleccionado. Si tiene overrides (texto, duración, transición propios), muestra confirmación previa
- **Drop de múltiples archivos:** se pueden arrastrar múltiples imágenes a la vez, se añaden al final en el orden del sistema de archivos

#### Panel de Override por Slide (inline)
Se expande inline debajo de cada miniatura al hacer click en un icono de edición. Contiene:
- **Duración individual** (override del global)
- **Transición individual** (override del global, con selector completo)
- **Dirección de transición** (si aplica)
- **Duración de transición individual** (override del global)
- **Título / Subtítulo de texto** (ver sección Overlays de Texto)
- Botón para **eliminar todos los overrides** de ese slide

#### Botones del panel lateral
- **Añadir imágenes** (abre selector de archivo múltiple)
- **Papelera** en cada miniatura para eliminar slide individual

---

## 4. Overlays de Texto

### Texto Global (se aplica a todas las slides)
Configurable en el panel de configuración global. Actúa como plantilla base:
- **Título global** y **Subtítulo global** (inputs de texto)
- Mismos controles de estilo que el texto por slide (fuente, tamaño, color, posición, fondo, animación, duración visible)
- Los slides que tengan texto propio definido **ignoran el texto global** en esa slide

### Texto por Slide (override individual)
Configurable en el panel de override inline de cada slide. Anula el texto global para ese slide concreto:
- **Campo vacío = sin texto en ese slide** (desactiva tanto el texto propio como el global para esa slide)
- Los controles son idénticos a los del texto global

Configurable en el panel de override de cada slide individualmente.

### Controles de estilo (compartidos por texto global y por slide)
- **Título** (input de texto)
- **Subtítulo** (input de texto secundario, opcional)
- **Fuente:** selección entre 4-5 fuentes curadas de Google Fonts
- **Tamaño de fuente** (slider o input numérico)
- **Color del texto** (color picker)
- **Opacidad del texto** (slider)
- **Posición:** libre — el usuario arrastra el bloque de texto directamente sobre el preview. Como referencia rápida, se ofrecen snaps en posición arriba/centro/abajo centrado
- **Fondo del texto:** ninguno / pill (cápsula detrás del texto) / barra horizontal semitransparente — con control de opacidad
- **Animación de entrada:** Fade In / Slide Up / Ninguna
- **Duración visible del texto** (en segundos — puede ser menos que la duración total del slide)

---

## 5. Modo Presentación (Pantalla Completa)

### Activación
- Botón en controles del preview
- Tecla **F**

### Comportamiento
- La interfaz completa desaparece. Solo se ven las imágenes a pantalla completa
- El slideshow avanza automáticamente (autoplay activo)
- El usuario puede adelantar o retroceder manualmente en cualquier momento

### Overlay en Pantalla Completa
Aparece al mover el ratón. Desaparece automáticamente tras **3 segundos de inactividad**. Contiene:
- Botón **Slide anterior**
- Botón **Play / Pause** (refleja el estado real)
- Botón **Slide siguiente**
- Contador de slide actual: `3 / 12`
- **Barra de progreso** del slideshow completo
- Botón **Salir de pantalla completa**
- Todos los botones reflejan el estado actual en tiempo real

### Controles de Teclado (modo presentación y modo normal)
| Tecla | Acción |
|-------|--------|
| `←` | Slide anterior |
| `→` | Slide siguiente |
| `Espacio` | Play / Pause |
| `F` | Entrar / Salir pantalla completa |
| `Escape` | Salir de pantalla completa |
| `R` | Reiniciar desde el principio |
| `M` | Mute / Unmute audio |
| `T` | Ciclar por modos de transición (orden: Fade → Slide → Ken Burns → Zoom Punch → Wipe → Cross-Zoom → Flash → Glitch → Random → Fade...) |

---

## 6. Comportamiento del Slideshow

- **Al llegar al final:** el usuario elige mediante un **toggle de Loop** en la interfaz si el slideshow vuelve al principio o se detiene en el último slide
- **Al hacer loop:** se ejecuta la transición configurada (no hay corte directo) entre el último y el primer slide
- **Autoplay en preview:** activo por defecto, el usuario puede pausar en cualquier momento

---

## 7. Motor de Exportación

### Arquitectura (por prioridad)
1. **WebCodecs API + mp4-muxer** — motor primario. Hardware-accelerated, hasta 10x más rápido que tiempo real. Disponible en Chrome y Edge modernos.
2. **ffmpeg.wasm** — fallback para Firefox y Safari. Requiere headers CORS específicos (`COEP: require-corp`, `COOP: same-origin`). Más lento pero compatible.

### Indicadores de compatibilidad
- Puntos verde/rojo en el panel de exportación que indican en tiempo real si el codec/formato elegido es compatible con el navegador actual del usuario

### Proceso de exportación con cola
- El usuario puede añadir múltiples trabajos de exportación a una **cola de exportación** sin bloquear la UI
- Mientras se exporta, el usuario puede seguir editando el proyecto, añadir más slides, cambiar configuración, etc.
- Cada trabajo en la cola representa una exportación con los parámetros en el momento en que se añadió (snapshot del estado)
- La cola se procesa en orden FIFO (primero en entrar, primero en salir)
- El header muestra el progreso del trabajo activo con barra de progreso y porcentaje
- El indicador de estado cambia a "Grabando" (círculo naranja) mientras hay trabajos en proceso
- Al completarse cada trabajo: descarga automática del archivo + toast con nombre del archivo
- Al vaciarse la cola: sonido suave de confirmación + indicador vuelve a "En Vivo"
- Si un trabajo falla: toast de error con opción de reintentar ese trabajo concreto

### Cola de exportación — UI
- Panel de cola visible (expandible desde el header o zona fija) mostrando:
  - Trabajo en curso con barra de progreso
  - Trabajos pendientes en lista (con sus parámetros: resolución, FPS, formato)
  - Opción de cancelar cualquier trabajo pendiente
  - Historial de trabajos completados en la sesión

### Parámetros de exportación configurables
- **Resolución:** 720p / 1080p / 4K
- **FPS:** 24 / 30 / 60
- **Bitrate:** Bajo / Medio / Alto / Manual (Mbps)
- **Formato:** MP4 / WebM
- **Nombre del archivo:** editable por el usuario
- **Estimación de peso:** calculada en tiempo real según resolución, FPS y bitrate

---

## 8. Gestión del Proyecto

### Persistencia
- **Autosave automático en localStorage:** el proyecto se guarda continuamente. Al reabrir la app, recupera el último estado
- **Un solo proyecto en localStorage** (el último activo)
- **Export / Import JSON:** botón en el header para exportar el proyecto completo como archivo `.json` y para importar uno previamente guardado. Al importar, se muestra un **diálogo de confirmación** advirtiendo que el proyecto actual se perderá
- **Undo stack:** máximo 50 operaciones

### Undo / Redo
- **Ctrl+Z:** deshacer última acción
- **Ctrl+Shift+Z / Ctrl+Y:** rehacer
- Aplica a: reordenación de slides, eliminación, adición, cambios de configuración

---

## 9. Adición y Gestión de Imágenes

### Formatos de imagen soportados
- **JPG / JPEG**
- **PNG**

Otros formatos (WebP, HEIC, AVIF, GIF) no están soportados. Si el usuario intenta cargar un formato no soportado, se muestra un toast de error indicando el formato rechazado.

### Carga de imágenes
- **Drag & drop de archivos locales** directamente en la zona del panel lateral o sobre el canvas del preview
- **Múltiples imágenes a la vez:** se pueden soltar varios archivos en una sola acción; se añaden al final en el orden del sistema de archivos
- **Botón "Añadir imágenes"** en el panel lateral (abre selector de archivo múltiple, filtrado a JPG/PNG)
- **Reemplazar imagen:** click derecho en la miniatura → "Reemplazar imagen" (mantiene todos los overrides del slide)
- **Eliminar slide:** icono de papelera en la miniatura, o tecla `Delete/Backspace` con el slide seleccionado. Si el slide tiene overrides (texto, duración, transición), muestra diálogo de confirmación

### Estado visual del slide seleccionado
- La miniatura activa/seleccionada en el panel lateral muestra un **borde naranja de 2px** como indicador de selección

---

## 10. Responsividad y Plataforma

- Optimizada para **pantallas de escritorio** (layout horizontal con tres columnas)
- No se garantiza funcionalidad en móvil (fuera de scope)
- Requiere navegador moderno con soporte para Canvas API, File API y preferiblemente WebCodecs

---

## 11. Checklist de Verificación del Spec

### Diseño ✓
- [x] Paleta Dark Studio definida
- [x] Tipografía dual (sans-serif + mono)
- [x] Efectos glassmorphism y animaciones

### Canvas y formato ✓
- [x] 7 presets de ratio predefinidos + personalizado libre (W×H)
- [x] Presets personalizados: botón "Guardar como preset" con nombre, sin límite
- [x] Posicionamiento de texto y watermark: libre por drag, sin snaps
- [x] Resolución 720p/1080p/4K
- [x] 4 modos de fit de imagen

### Fondo ✓
- [x] Blur ajustable
- [x] Color sólido
- [x] Vignette/overlay oscuro
- [x] Cover forzado

### Transiciones ✓
- [x] 7 transiciones nombradas + Random (Glitch eliminado)
- [x] Zoom Punch: zoom in AND zoom out
- [x] Cross-zoom: velocidad configurable con slider
- [x] Ken Burns: dirección configurable + slider de intensidad de zoom (min/max)
- [x] Slide y Wipe: dirección configurable (4 opciones)
- [x] Flash: color elegible por el usuario
- [x] Duración controlable global e individual por slide
- [x] Override completo por slide
- [x] Ciclo tecla T: Fade → Slide → Ken Burns → Zoom Punch → Wipe → Cross-Zoom → Flash → Random → Fade...

### Audio ✓
- [x] Un solo track de audio por proyecto
- [x] Formatos soportados: MP3, WAV, OGG
- [x] Barra de seek (slider de posición en preview, independiente de exportación)
- [x] Trim In y Trim Out: sliders/inputs numéricos independientes (definen rango de exportación)
- [x] Volumen, fade in/out, loop
- [x] Fade out automático si audio > duración del video

### Overlays de texto ✓
- [x] Texto global (aplica a todas las slides como plantilla base)
- [x] Texto por slide (override individual — campo vacío desactiva texto global en esa slide)
- [x] Título + subtítulo, fuente (5 curadas), tamaño, color, opacidad
- [x] Posicionamiento libre por drag sobre preview (sin snaps)
- [x] Fondo semitransparente (pill / barra)
- [x] Animación de entrada
- [x] Duración visible configurable

### Overlays globales ✓
- [x] Marca de agua PNG: posicionamiento libre por drag sobre preview, escala (slider), opacidad (slider)
- [x] Frame/marco PNG transparente con opacidad
- [x] Vignette global con intensidad y color

### Panel lateral ✓
- [x] Miniaturas con número de orden (mono)
- [x] Badge de duración si tiene override
- [x] Icono de transición si tiene override
- [x] Badge de baja resolución: icono informativo (solo si imagen < resolución de exportación elegida, no bloquea)
- [x] Slide seleccionado: borde naranja 2px en miniatura activa
- [x] Click para saltar al slide en preview
- [x] Drag & drop estilo Notion/Figma
- [x] Múltiples imágenes a la vez
- [x] Click derecho → reemplazar imagen (mantiene overrides)
- [x] Panel de override inline bajo cada miniatura

### Imágenes ✓
- [x] Formatos soportados: JPG/JPEG y PNG únicamente
- [x] Toast de error si se carga formato no soportado

### Fullscreen y controles ✓
- [x] Overlay con prev/next/play-pause, contador, barra de progreso, botón salir
- [x] Desaparece a 3s de inactividad, reaparece con movimiento de ratón
- [x] 8 atajos de teclado definidos con orden de ciclo T especificado

### Exportación ✓
- [x] WebCodecs + mp4-muxer (primario, Chrome/Edge)
- [x] ffmpeg.wasm (fallback, Firefox/Safari)
- [x] FPS, resolución, bitrate, formato, nombre de archivo configurables
- [x] Indicadores de compatibilidad verde/rojo por navegador
- [x] Estimación de peso en tiempo real
- [x] **Cola de exportación (queue):** múltiples trabajos, UI no se bloquea, el usuario puede seguir editando
- [x] Cada trabajo es un snapshot del estado en el momento de añadirlo a la cola
- [x] Panel de cola con trabajo activo, pendientes, cancelación y historial de sesión
- [x] Barra de progreso en header para el trabajo activo
- [x] Toast por trabajo completado + sonido al vaciar la cola
- [x] Toast de error con opción de reintento si un trabajo falla

### Proyecto ✓
- [x] Autosave localStorage (un proyecto, el último activo)
- [x] Export / Import JSON manual
- [x] Import: diálogo de confirmación antes de reemplazar proyecto activo
- [x] Undo / Redo (Ctrl+Z / Ctrl+Shift+Z) — stack de 50 operaciones

### Comportamiento general ✓
- [x] Toggle loop (para en última o vuelve al inicio)
- [x] Loop ejecuta transición (no corte directo)
- [x] Delete/Backspace con confirmación si hay overrides
- [x] Indicador "En Vivo / Grabando" en header

---

*Fin del documento de especificación — Sequentia v1.0*
