# Slide Motion Effects — Design Spec

**Date:** 2026-04-12  
**Status:** Approved  
**Project:** Sequentia

---

## Overview

Add per-slide motion effects (zoom, pan, Ken Burns) that animate the main image while it is displayed. Same control model as transitions: global default, per-slide override, and random mode.

---

## Effects List

| ID | UI Label | Description |
|---|---|---|
| `none` | Ninguno | Static, no movement (default) |
| `zoom-in` | Zoom + | Zoom in toward center |
| `zoom-out` | Zoom − | Zoom out from center |
| `pan-right` | Pan → | Pan left to right |
| `pan-left` | Pan ← | Pan right to left |
| `pan-down` | Pan ↓ | Pan top to bottom |
| `pan-up` | Pan ↑ | Pan bottom to top |
| `ken-burns` | Ken Burns | Zoom-in + diagonal pan (top-left → bottom-right) |
| `ken-burns-rev` | KB Rev. | Zoom-out + reverse diagonal |
| `random` | Random | Random per slide from pool (excludes `none` and `random`) |

**Fixed internal values:**
- Zoom amount: 15% (scale delta = 0.15)
- Pan amount: 6% of canvas dimension
- Easing: ease-in-out quadratic on all effects

---

## State & Data Model

### Global config
```
state.config.slideEffect  — string, default: 'none'
```

### Per-slide override
```
slide.overrides.effect    — string | null (null = inherit global)
```

### Runtime
```
EFFECTS_LIST              — const array of all 10 IDs (same pattern as TRANSITIONS_LIST)
_randomEffect             — string, picked when each slide starts playing
                            pool: EFFECTS_LIST minus 'none' and 'random'
```

### Getter
```javascript
function getEffectiveEffect(slide) {
  const raw = slide?.overrides?.effect || state.config.slideEffect || 'none';
  return raw === 'random' ? (_randomEffect || 'zoom-in') : raw;
}
```

`_randomEffect` is resolved here so that `drawSlide` always receives a concrete effect ID, never `'random'`.

Serialization: `overrides.effect` is a plain string inside the existing `overrides` object — serializes automatically with the rest of the project state.

---

## Helper: `applyMotion`

Pure function, defined once and duplicated into worker scope (same pattern as transition functions).

```javascript
function applyMotion(fit, effect, p, w, h)
// fit: { dx, dy, dw, dh } — base rect from calcFit()
// effect: string — effect ID
// p: number — eased progress 0→1
// w, h: canvas dimensions
// Returns: { dx, dy, dw, dh }
```

**Effect math:**

- `zoom-in`: scale from 1.0 → 1+ZOOM, centered on fit rect center
- `zoom-out`: scale from 1+ZOOM → 1.0, centered
- `pan-right`: translate dx by `−w×PAN×(1−p) + w×PAN×p` (moves right)
- `pan-left`: opposite pan direction
- `pan-down`: translate dy in downward direction
- `pan-up`: opposite
- `ken-burns`: zoom-in math + diagonal translation `w×(PAN/2)×p` on both axes
- `ken-burns-rev`: zoom-out math + reverse diagonal
- `none` / any unknown: return fit unchanged

**Easing:**
```javascript
function easeInOut(p) { return p < 0.5 ? 2*p*p : -1+(4-2*p)*p; }
```

Effect only applies to the **main image layer** (step 3 of `drawSlide`). Background blur layer stays fixed.

---

## Changes to `drawSlide` / `drawSlideWorker`

At step 3 (main image draw), replace:
```javascript
const fit = calcFit(...);
ctx.drawImage(slide._bitmap, fit.dx, fit.dy, fit.dw, fit.dh);
```
With:
```javascript
const fit = calcFit(...);
const dur = getEffectiveDuration(slide);
const p = easeInOut(Math.min(t / Math.max(dur, 0.001), 1));
const effect = getEffectiveEffect(slide);
const mfit = applyMotion(fit, effect, p, w, h);
ctx.drawImage(slide._bitmap, mfit.dx, mfit.dy, mfit.dw, mfit.dh);
```

Worker version uses same logic with `config` passed in as parameter (same as current worker pattern).

---

## Changes to Transition Functions

All transition functions currently call `drawSlide(ctx, slideA, 0)`, which would snap the outgoing slide back to its start position. Fix: pass `t=1` for slideA (frozen at end of effect) and `t=0` for slideB (starts fresh).

Affects 6 main-thread functions + 6 worker functions:
- `transitionFade` / `transitionFadeW`
- `transitionSlide` / `transitionSlideW`
- `transitionZoomPunch` / `transitionZoomPunchW`
- `transitionWipe` / `transitionWipeW`
- `transitionCrossZoom` / `transitionCrossZoomW`
- `transitionFlash` / `transitionFlashW`

---

## Changes to Playback (`_tick`)

When a new slide starts (i.e., `_slideElapsed` resets to 0), always pick a new `_randomEffect` (cheap Math.random call, used only when `getEffectiveEffect` resolves to `'random'`):

```javascript
_randomEffect = EFFECTS_LIST.filter(e => e !== 'none' && e !== 'random')[
  Math.floor(Math.random() * (EFFECTS_LIST.length - 2))
];
```

`getEffectiveEffect` checks `_randomEffect` when the effective effect is `'random'`.

---

## UI

### Config panel — Composición > Ritmo subsection

Add "Efecto" subsection after the existing "Transición" subsection:

```html
<div class="ov-subsection">
  <div class="cfg-row" style="margin-bottom:8px">
    <span class="cfg-label" style="font-weight:500;color:var(--text)">Efecto</span>
  </div>
  <div class="pill-group" id="pillEffect">
    <!-- pills: Ninguno, Zoom+, Zoom−, Pan→, Pan←, Pan↓, Pan↑, Ken Burns, KB Rev., Random -->
  </div>
</div>
```

Event listener on `#pillEffect` (same pattern as `#pillTransition`): updates `state.config.slideEffect`, syncs active pill, calls `pushUndo()` + `debouncedSave()`.

### Override panel (`buildOverridePanel`)

Add effect row after the transition row:

```html
<div class="ov-row">
  <span class="ov-label">Efecto</span>
  <select class="ov-effect" ...>
    <option value="">Global (${state.config.slideEffect})</option>
    <!-- all 10 effect options -->
  </select>
</div>
```

Handler: same pattern as `ov-transition`.

### Override badge

The existing badge detection checks `ov.duration || ov.transition || ov.transitionDuration || ov.textMode`. Add `|| ov.effect` to include effect overrides.

---

## Serialization

No changes needed. `overrides.effect` is a plain string field within the existing `overrides` object, which is already fully serialized to IndexedDB and JSON export.

---

## Implementation Scope

| Area | Change |
|---|---|
| `applyMotion()` | New helper (main + worker) |
| `easeInOut()` | New helper (main + worker) |
| `drawSlide()` | Apply motion at step 3 |
| `drawSlideWorker()` | Same |
| 6 transition functions | `drawSlide(slideA, 0)` → `drawSlide(slideA, 1)` |
| 6 worker transition functions | Same |
| `getEffectiveEffect()` | New getter |
| `_tick()` | Pick `_randomEffect` on slide start |
| `EFFECTS_LIST` | New constant |
| `_randomEffect` | New runtime variable |
| `state.config.slideEffect` | New default in state init |
| `buildConfigPanels()` | Add Efecto pills + listener |
| `buildOverridePanel()` | Add effect select row |
| Override badge | Add `ov.effect` check |
