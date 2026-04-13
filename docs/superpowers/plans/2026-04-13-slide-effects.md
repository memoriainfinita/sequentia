# Slide Motion Effects — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-slide motion effects (zoom, pan, Ken Burns) to Sequentia, with global default, per-slide override, and random mode — same control model as transitions.

**Architecture:** A pure `applyMotion(fit, effect, p, w, h)` helper transforms the static `calcFit()` rect into an animated one based on eased progress `p`. It is duplicated into the Web Worker scope. The main image draw step in both `drawSlide` and `drawSlideWorker` is updated to call it. Export resolves effect IDs before sending to the worker.

**Tech Stack:** Vanilla JS/HTML/CSS, single file (`sequentia.html`), no frameworks, no build tools. Export uses WebCodecs + Mediabunny in a Web Worker.

**Spec:** `docs/superpowers/specs/2026-04-13-slide-effects-design.md`

---

## Files

| File | Action |
|---|---|
| `sequentia.html` | All changes — this is the entire app |

---

### Task 1: Constants, state default, and helpers (main thread)

**File:** `sequentia.html`

Add `EFFECTS_LIST`, `_randomEffect`, the `easeInOut` easing function, and the `applyMotion` helper. Add `slideEffect: 'none'` to the initial state config.

- [ ] **Step 1: Add `slideEffect: 'none'` to state config**

Find line ~682 where `state.config` is declared:
```javascript
slideDuration: 3.0, transitionDuration: 0.5,
transition: 'fade',
```
Change to:
```javascript
slideDuration: 3.0, transitionDuration: 0.5,
transition: 'fade', slideEffect: 'none',
```

- [ ] **Step 2: Add `EFFECTS_LIST` and `_randomEffect` variable**

Find line ~1963 where `_randomTransition` and related constants are declared:
```javascript
let _randomTransition = 'fade';

const RANDOM_POOL = ['fade', ...
```
Add immediately before that block:
```javascript
const EFFECTS_LIST = ['none','zoom-in','zoom-out','pan-right','pan-left','pan-down','pan-up','ken-burns','ken-burns-rev','random'];
const EFFECT_RANDOM_POOL = ['zoom-in','zoom-out','pan-right','pan-left','pan-down','pan-up','ken-burns','ken-burns-rev'];
let _randomEffect = 'zoom-in';
function pickRandomEffect() {
  return EFFECT_RANDOM_POOL[Math.floor(Math.random() * EFFECT_RANDOM_POOL.length)];
}

```

- [ ] **Step 3: Add `easeInOut` and `applyMotion` helpers**

Add immediately after `pickRandomEffect()`:
```javascript
function easeInOut(p) { return p < 0.5 ? 2*p*p : -1+(4-2*p)*p; }

function applyMotion(fit, effect, p, w, h) {
  const ZOOM = 0.15;
  const PAN  = 0.06;
  let { dx, dy, dw, dh } = fit;
  switch (effect) {
    case 'zoom-in': {
      const scale = 1 + ZOOM * p;
      const cx = dx + dw / 2, cy = dy + dh / 2;
      return { dx: cx - (dw * scale) / 2, dy: cy - (dh * scale) / 2, dw: dw * scale, dh: dh * scale };
    }
    case 'zoom-out': {
      const scale = 1 + ZOOM * (1 - p);
      const cx = dx + dw / 2, cy = dy + dh / 2;
      return { dx: cx - (dw * scale) / 2, dy: cy - (dh * scale) / 2, dw: dw * scale, dh: dh * scale };
    }
    case 'pan-right':
      return { dx: dx + w * PAN * (2 * p - 1), dy, dw, dh };
    case 'pan-left':
      return { dx: dx + w * PAN * (1 - 2 * p), dy, dw, dh };
    case 'pan-down':
      return { dx, dy: dy + h * PAN * (2 * p - 1), dw, dh };
    case 'pan-up':
      return { dx, dy: dy + h * PAN * (1 - 2 * p), dw, dh };
    case 'ken-burns': {
      const scale = 1 + ZOOM * p;
      const cx = dx + dw / 2, cy = dy + dh / 2;
      const panX = w * (PAN / 2) * p;
      const panY = h * (PAN / 2) * p;
      return { dx: cx - (dw * scale) / 2 - panX, dy: cy - (dh * scale) / 2 - panY, dw: dw * scale, dh: dh * scale };
    }
    case 'ken-burns-rev': {
      const scale = 1 + ZOOM * (1 - p);
      const cx = dx + dw / 2, cy = dy + dh / 2;
      const panX = w * (PAN / 2) * (1 - p);
      const panY = h * (PAN / 2) * (1 - p);
      return { dx: cx - (dw * scale) / 2 + panX, dy: cy - (dh * scale) / 2 + panY, dw: dw * scale, dh: dh * scale };
    }
    default:
      return fit;
  }
}
```

- [ ] **Step 4: Verify no syntax errors**

Open `sequentia.html` in Firefox. Open DevTools console. Confirm no errors appear on load.

- [ ] **Step 5: Commit**
```bash
git add sequentia.html
git commit -m "feat: EFFECTS_LIST, applyMotion, easeInOut helpers — slide motion effects foundation"
```

---

### Task 2: `getEffectiveEffect` getter + `_tick` random pick

**File:** `sequentia.html`

Add the getter function and wire up `_randomEffect` selection whenever a new slide starts.

- [ ] **Step 1: Add `getEffectiveEffect` getter**

Find the block containing `getEffectiveTransition` (~line 1615):
```javascript
function getEffectiveTransition(slide) {
  if (slide?.overrides?.transition) return slide.overrides.transition;
```
Add immediately after the closing `}` of `getEffectiveTransition`:
```javascript
function getEffectiveEffect(slide) {
  const raw = slide?.overrides?.effect || state.config.slideEffect || 'none';
  return raw === 'random' ? (_randomEffect || 'zoom-in') : raw;
}
```

- [ ] **Step 2: Pick `_randomEffect` when a new slide starts in `_tick`**

There are two places in `_tick` where `_slideElapsed = 0` is set (after a transition ends, and when skipping directly). Find the first one (~line 1746), which is inside `if (_inTransition)`:
```javascript
_inTransition = false;
_transElapsed = 0;
_slideElapsed = 0;
```
Change to:
```javascript
_inTransition = false;
_transElapsed = 0;
_slideElapsed = 0;
_randomEffect = pickRandomEffect();
```

Find the second one (~line 1775), inside the `else if (hasNext && transDur === 0)` branch:
```javascript
// Sin transición — saltar directamente
_slideElapsed = 0;
const nextIdx = state.currentIndex + 1;
```
Change to:
```javascript
// Sin transición — saltar directamente
_slideElapsed = 0;
_randomEffect = pickRandomEffect();
const nextIdx = state.currentIndex + 1;
```

- [ ] **Step 3: Pick initial `_randomEffect` when playback starts**

Find `function play()` (~line 1694):
```javascript
function play() {
  if (state.slides.length === 0) return;
  state.playing = true;
  _lastTime = null;
```
Change to:
```javascript
function play() {
  if (state.slides.length === 0) return;
  state.playing = true;
  _lastTime = null;
  _randomEffect = pickRandomEffect();
```

- [ ] **Step 4: Verify in browser console**

Open `sequentia.html` in Firefox. In console, type:
```javascript
getEffectiveEffect(state.slides[0])
```
Should return `'none'` (default config). No errors.

- [ ] **Step 5: Commit**
```bash
git add sequentia.html
git commit -m "feat: getEffectiveEffect getter + random effect pick in _tick and play()"
```

---

### Task 3: Apply motion in `drawSlide` (main thread preview)

**File:** `sequentia.html`

Update step 3 of `drawSlide` to call `applyMotion`.

- [ ] **Step 1: Update step 3 of `drawSlide`**

Find `drawSlide` (~line 1495). Locate step 3 (~line 1539):
```javascript
      // 3. Imagen principal (según fitMode)
      if (slide._bitmap) {
        const fit = calcFit(slide._bitmap.width, slide._bitmap.height, w, h, cfg.fitMode || 'contain');
        ctx.drawImage(slide._bitmap, fit.dx, fit.dy, fit.dw, fit.dh);
      }
```
Replace with:
```javascript
      // 3. Imagen principal (según fitMode) + efecto de movimiento
      if (slide._bitmap) {
        const fit = calcFit(slide._bitmap.width, slide._bitmap.height, w, h, cfg.fitMode || 'contain');
        const dur = getEffectiveDuration(slide);
        const p = easeInOut(Math.min(t / Math.max(dur, 0.001), 1));
        const mfit = applyMotion(fit, getEffectiveEffect(slide), p, w, h);
        ctx.drawImage(slide._bitmap, mfit.dx, mfit.dy, mfit.dw, mfit.dh);
      }
```

- [ ] **Step 2: Verify motion in browser**

Open `sequentia.html` in Firefox. Load 2+ images. In console:
```javascript
state.config.slideEffect = 'zoom-in';
renderFrame(0);   // should look normal (p=0, no zoom)
renderFrame(1);   // should look zoomed in ~15%
```
Confirm zoom is visible. Then:
```javascript
state.config.slideEffect = 'pan-right';
renderFrame(0);   // image shifted slightly left
renderFrame(1);   // image shifted slightly right
```

- [ ] **Step 3: Verify with none (regression check)**

```javascript
state.config.slideEffect = 'none';
renderFrame(0.5);
```
Confirm no visual change from before this task.

- [ ] **Step 4: Commit**
```bash
git add sequentia.html
git commit -m "feat: apply motion effect in drawSlide — main thread preview"
```

---

### Task 4: Fix transition functions — freeze slideA at t=1 (main thread)

**File:** `sequentia.html`

All 6 main-thread transition functions call `drawSlide(ctx, slideA, 0)`, which would snap the departing slide back to its start position. Fix: pass `t=1` for slideA (frozen at its final effect position), `t=0` for slideB.

- [ ] **Step 1: Fix `transitionFade`**

Find `transitionFade` (~line 1861):
```javascript
    function transitionFade(ctx, slideA, slideB, t, w, h) {
      drawSlide(ctx, slideA, 0);
      const tmp = new OffscreenCanvas(w, h);
      drawSlide(tmp.getContext('2d'), slideB, 0);
```
Change to:
```javascript
    function transitionFade(ctx, slideA, slideB, t, w, h) {
      drawSlide(ctx, slideA, 1);
      const tmp = new OffscreenCanvas(w, h);
      drawSlide(tmp.getContext('2d'), slideB, 0);
```

- [ ] **Step 2: Fix `transitionSlide`**

Find `transitionSlide` (~line 1870):
```javascript
      const tmpA = new OffscreenCanvas(w, h);
      drawSlide(tmpA.getContext('2d'), slideA, 0);
      const tmpB = new OffscreenCanvas(w, h);
      drawSlide(tmpB.getContext('2d'), slideB, 0);
```
Change to:
```javascript
      const tmpA = new OffscreenCanvas(w, h);
      drawSlide(tmpA.getContext('2d'), slideA, 1);
      const tmpB = new OffscreenCanvas(w, h);
      drawSlide(tmpB.getContext('2d'), slideB, 0);
```

- [ ] **Step 3: Fix `transitionZoomPunch`**

Find `transitionZoomPunch` (~line 1889):
```javascript
      const tmpA = new OffscreenCanvas(w, h);
      drawSlide(tmpA.getContext('2d'), slideA, 0);
      const tmpB = new OffscreenCanvas(w, h);
      drawSlide(tmpB.getContext('2d'), slideB, 0);
```
Change to:
```javascript
      const tmpA = new OffscreenCanvas(w, h);
      drawSlide(tmpA.getContext('2d'), slideA, 1);
      const tmpB = new OffscreenCanvas(w, h);
      drawSlide(tmpB.getContext('2d'), slideB, 0);
```

- [ ] **Step 4: Fix `transitionWipe`**

Find `transitionWipe` (~line 1911):
```javascript
      const tmpA = new OffscreenCanvas(w, h);
      drawSlide(tmpA.getContext('2d'), slideA, 0);
      const tmpB = new OffscreenCanvas(w, h);
      drawSlide(tmpB.getContext('2d'), slideB, 0);
```
Change to:
```javascript
      const tmpA = new OffscreenCanvas(w, h);
      drawSlide(tmpA.getContext('2d'), slideA, 1);
      const tmpB = new OffscreenCanvas(w, h);
      drawSlide(tmpB.getContext('2d'), slideB, 0);
```

- [ ] **Step 5: Fix `transitionCrossZoom`**

Find `transitionCrossZoom` (~line 1929):
```javascript
      const tmpA = new OffscreenCanvas(w, h);
      drawSlide(tmpA.getContext('2d'), slideA, 0);
      const tmpB = new OffscreenCanvas(w, h);
      drawSlide(tmpB.getContext('2d'), slideB, 0);
```
Change to:
```javascript
      const tmpA = new OffscreenCanvas(w, h);
      drawSlide(tmpA.getContext('2d'), slideA, 1);
      const tmpB = new OffscreenCanvas(w, h);
      drawSlide(tmpB.getContext('2d'), slideB, 0);
```

- [ ] **Step 6: Fix `transitionFlash`**

`transitionFlash` is special — it picks between slideA and slideB depending on `t`. Find it (~line 1952):
```javascript
    function transitionFlash(ctx, slideA, slideB, t, w, h, color = '#ffffff') {
      const flashT = t < 0.5 ? t * 2 : (1 - t) * 2;
      const tmp = new OffscreenCanvas(w, h);
      drawSlide(tmp.getContext('2d'), t < 0.5 ? slideA : slideB, 0);
```
Change to:
```javascript
    function transitionFlash(ctx, slideA, slideB, t, w, h, color = '#ffffff') {
      const flashT = t < 0.5 ? t * 2 : (1 - t) * 2;
      const tmp = new OffscreenCanvas(w, h);
      drawSlide(tmp.getContext('2d'), t < 0.5 ? slideA : slideB, t < 0.5 ? 1 : 0);
```

- [ ] **Step 7: Visual verification in Firefox**

Load 2+ images with `slideEffect = 'zoom-in'`. Press play. Watch the transition between slides — the outgoing slide should hold its zoomed-in position as the transition plays, not snap back to the original. No console errors.

- [ ] **Step 8: Commit**
```bash
git add sequentia.html
git commit -m "fix: freeze slide motion effect at t=1 during transitions (main thread)"
```

---

### Task 5: Worker helpers + `drawSlideWorker` + `prepareExportPayload`

**File:** `sequentia.html`

Add `easeInOut` and `applyMotion` to the worker scope. Update `drawSlideWorker` step 3. Add `resolvedEffect` to the export payload.

- [ ] **Step 1: Add `easeInOut` and `applyMotion` to worker scope**

The worker functions are defined in the inline `<script type="text/plain" id="worker-src">` block, starting around line 4081. Find the worker's `calcFit` function (it's near the top of the worker code). Add `easeInOut` and `applyMotion` immediately after `calcFit` in the worker scope:

```javascript
function easeInOut(p) { return p < 0.5 ? 2*p*p : -1+(4-2*p)*p; }

function applyMotion(fit, effect, p, w, h) {
  const ZOOM = 0.15;
  const PAN  = 0.06;
  let { dx, dy, dw, dh } = fit;
  switch (effect) {
    case 'zoom-in': {
      const scale = 1 + ZOOM * p;
      const cx = dx + dw / 2, cy = dy + dh / 2;
      return { dx: cx - (dw * scale) / 2, dy: cy - (dh * scale) / 2, dw: dw * scale, dh: dh * scale };
    }
    case 'zoom-out': {
      const scale = 1 + ZOOM * (1 - p);
      const cx = dx + dw / 2, cy = dy + dh / 2;
      return { dx: cx - (dw * scale) / 2, dy: cy - (dh * scale) / 2, dw: dw * scale, dh: dh * scale };
    }
    case 'pan-right':
      return { dx: dx + w * PAN * (2 * p - 1), dy, dw, dh };
    case 'pan-left':
      return { dx: dx + w * PAN * (1 - 2 * p), dy, dw, dh };
    case 'pan-down':
      return { dx, dy: dy + h * PAN * (2 * p - 1), dw, dh };
    case 'pan-up':
      return { dx, dy: dy + h * PAN * (1 - 2 * p), dw, dh };
    case 'ken-burns': {
      const scale = 1 + ZOOM * p;
      const cx = dx + dw / 2, cy = dy + dh / 2;
      const panX = w * (PAN / 2) * p;
      const panY = h * (PAN / 2) * p;
      return { dx: cx - (dw * scale) / 2 - panX, dy: cy - (dh * scale) / 2 - panY, dw: dw * scale, dh: dh * scale };
    }
    case 'ken-burns-rev': {
      const scale = 1 + ZOOM * (1 - p);
      const cx = dx + dw / 2, cy = dy + dh / 2;
      const panX = w * (PAN / 2) * (1 - p);
      const panY = h * (PAN / 2) * (1 - p);
      return { dx: cx - (dw * scale) / 2 + panX, dy: cy - (dh * scale) / 2 + panY, dw: dw * scale, dh: dh * scale };
    }
    default:
      return fit;
  }
}
```

- [ ] **Step 2: Update step 3 of `drawSlideWorker`**

Find `drawSlideWorker` (~line 4083). Locate step 3 (~line 4122):
```javascript
  // 3. Main image (fitMode)
  if (slide.bitmap) {
    const fit = calcFit(slide.bitmap.width, slide.bitmap.height, w, h, config.fitMode || 'contain');
    ctx.drawImage(slide.bitmap, fit.dx, fit.dy, fit.dw, fit.dh);
  }
```
Replace with:
```javascript
  // 3. Main image (fitMode) + motion effect
  if (slide.bitmap) {
    const fit = calcFit(slide.bitmap.width, slide.bitmap.height, w, h, config.fitMode || 'contain');
    const p = easeInOut(Math.min(t / Math.max(slide.duration, 0.001), 1));
    const mfit = applyMotion(fit, slide.resolvedEffect || 'none', p, w, h);
    ctx.drawImage(slide.bitmap, mfit.dx, mfit.dy, mfit.dw, mfit.dh);
  }
```

- [ ] **Step 3: Add `resolvedEffect` to `prepareExportPayload`**

Find `prepareExportPayload` (~line 3419). Locate the slide payload construction:
```javascript
        return {
          bitmap,
          duration: slide.overrides?.duration ?? state.config.slideDuration,
          transition: getEffectiveTransition(slide),
          textObj: getEffectiveText(slide),
          overrides: slide.overrides ?? {},
        };
```
Change to:
```javascript
        return {
          bitmap,
          duration: slide.overrides?.duration ?? state.config.slideDuration,
          transition: getEffectiveTransition(slide),
          resolvedEffect: getEffectiveEffect(slide),
          textObj: getEffectiveText(slide),
          overrides: slide.overrides ?? {},
        };
```

- [ ] **Step 4: Verify export in Firefox**

Load 2+ images. Set `state.config.slideEffect = 'zoom-in'` in console. Click Export. The exported video should show the zoom-in motion on each slide. No worker errors in console.

- [ ] **Step 5: Commit**
```bash
git add sequentia.html
git commit -m "feat: motion effects in worker — applyMotion, drawSlideWorker, prepareExportPayload"
```

---

### Task 6: Fix worker transition functions — freeze slideA at t=1

**File:** `sequentia.html`

Same fix as Task 4 but for the 6 worker versions.

- [ ] **Step 1: Fix `transitionFadeW`**

Find `transitionFadeW` (~line 4252):
```javascript
function transitionFadeW(ctx, slideA, slideB, t, w, h, config) {
  drawSlideWorker(ctx, slideA, 0, w, h, config);
  const tmp = new OffscreenCanvas(w, h);
  drawSlideWorker(tmp.getContext('2d'), slideB, 0, w, h, config);
```
Change to:
```javascript
function transitionFadeW(ctx, slideA, slideB, t, w, h, config) {
  drawSlideWorker(ctx, slideA, 1, w, h, config);
  const tmp = new OffscreenCanvas(w, h);
  drawSlideWorker(tmp.getContext('2d'), slideB, 0, w, h, config);
```

- [ ] **Step 2: Fix `transitionSlideW`**

Find `transitionSlideW` (~line 4261):
```javascript
  const tmpA = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpA.getContext('2d'), slideA, 0, w, h, config);
  const tmpB = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpB.getContext('2d'), slideB, 0, w, h, config);
```
Change to:
```javascript
  const tmpA = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpA.getContext('2d'), slideA, 1, w, h, config);
  const tmpB = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpB.getContext('2d'), slideB, 0, w, h, config);
```

- [ ] **Step 3: Fix `transitionZoomPunchW`**

Find `transitionZoomPunchW` (~line 4280):
```javascript
  const tmpA = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpA.getContext('2d'), slideA, 0, w, h, config);
  const tmpB = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpB.getContext('2d'), slideB, 0, w, h, config);
```
Change to:
```javascript
  const tmpA = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpA.getContext('2d'), slideA, 1, w, h, config);
  const tmpB = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpB.getContext('2d'), slideB, 0, w, h, config);
```

- [ ] **Step 4: Fix `transitionWipeW`**

Find `transitionWipeW` (~line 4302):
```javascript
  const tmpA = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpA.getContext('2d'), slideA, 0, w, h, config);
  const tmpB = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpB.getContext('2d'), slideB, 0, w, h, config);
```
Change to:
```javascript
  const tmpA = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpA.getContext('2d'), slideA, 1, w, h, config);
  const tmpB = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpB.getContext('2d'), slideB, 0, w, h, config);
```

- [ ] **Step 5: Fix `transitionCrossZoomW`**

Find `transitionCrossZoomW` (~line 4320):
```javascript
  const tmpA = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpA.getContext('2d'), slideA, 0, w, h, config);
  const tmpB = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpB.getContext('2d'), slideB, 0, w, h, config);
```
Change to:
```javascript
  const tmpA = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpA.getContext('2d'), slideA, 1, w, h, config);
  const tmpB = new OffscreenCanvas(w, h);
  drawSlideWorker(tmpB.getContext('2d'), slideB, 0, w, h, config);
```

- [ ] **Step 6: Fix `transitionFlashW`**

Find `transitionFlashW` (~line 4344):
```javascript
function transitionFlashW(ctx, slideA, slideB, t, w, h, config) {
  const flashT = t < 0.5 ? t * 2 : (1 - t) * 2;
  const tmp = new OffscreenCanvas(w, h);
  drawSlideWorker(tmp.getContext('2d'), t < 0.5 ? slideA : slideB, 0, w, h, config);
```
Change to:
```javascript
function transitionFlashW(ctx, slideA, slideB, t, w, h, config) {
  const flashT = t < 0.5 ? t * 2 : (1 - t) * 2;
  const tmp = new OffscreenCanvas(w, h);
  drawSlideWorker(tmp.getContext('2d'), t < 0.5 ? slideA : slideB, t < 0.5 ? 1 : 0, w, h, config);
```

- [ ] **Step 7: Commit**
```bash
git add sequentia.html
git commit -m "fix: freeze slide motion effect at t=1 during transitions (worker)"
```

---

### Task 7: UI — Efecto pills in config panel

**File:** `sequentia.html`

Add the "Efecto" subsection to the Composición > Ritmo area, and wire the event listener.

- [ ] **Step 1: Add Efecto pills to `ritmoHTML`**

Find `buildConfigPanels` and locate the `ritmoHTML` string (~line 2346). It ends with:
```javascript
          <div class="transition-opts" id="transitionOpts"></div>
        </div>
      `;
```
Change to:
```javascript
          <div class="transition-opts" id="transitionOpts"></div>
        </div>
        <div class="ov-subsection" style="margin-top:10px">
          <div class="cfg-row" style="margin-bottom:8px">
            <span class="cfg-label" style="font-weight:500;color:var(--text)">Efecto</span>
          </div>
          <div class="pill-group" id="pillEffect">
            ${[
              ['none','Ninguno'],['zoom-in','Zoom +'],['zoom-out','Zoom −'],
              ['pan-right','Pan →'],['pan-left','Pan ←'],['pan-down','Pan ↓'],['pan-up','Pan ↑'],
              ['ken-burns','Ken Burns'],['ken-burns-rev','KB Rev.'],['random','Random']
            ].map(([v,l]) =>
              `<button class="pill${state.config.slideEffect === v ? ' active' : ''}" data-effect="${v}">${l}</button>`
            ).join('')}
          </div>
        </div>
      `;
```

- [ ] **Step 2: Add event listener for `#pillEffect`**

Find the event listener for `#pillTransition` (~line 2651):
```javascript
      document.getElementById('pillTransition').addEventListener('click', e => {
        const btn = e.target.closest('[data-trans]');
        if (!btn) return;
        state.config.transition = btn.dataset.trans;
        document.querySelectorAll('#pillTransition .pill').forEach(b => b.classList.toggle('active', b.dataset.trans === state.config.transition));
        updateTransitionOpts();
        pushUndo(); debouncedSave();
      });
```
Add immediately after that block:
```javascript
      document.getElementById('pillEffect').addEventListener('click', e => {
        const btn = e.target.closest('[data-effect]');
        if (!btn) return;
        state.config.slideEffect = btn.dataset.effect;
        document.querySelectorAll('#pillEffect .pill').forEach(b => b.classList.toggle('active', b.dataset.effect === state.config.slideEffect));
        pushUndo(); debouncedSave();
      });
```

- [ ] **Step 3: Visual verification**

Open `sequentia.html` in Firefox. The Composición panel should show an "Efecto" subsection below "Transición". Clicking "Zoom +" should highlight that pill. Press play — images should zoom in while displayed. Clicking "Ninguno" should restore static images.

- [ ] **Step 4: Commit**
```bash
git add sequentia.html
git commit -m "feat: Efecto pills UI in Composición panel"
```

---

### Task 8: UI — per-slide override panel + badge

**File:** `sequentia.html`

Add an effect row to `buildOverridePanel` and update the override badge to detect effect overrides.

- [ ] **Step 1: Add effect row to `buildOverridePanel`**

Find `buildOverridePanel` (~line 3183). Locate the transition row in the template HTML:
```javascript
        <div class="ov-row">
          <span class="ov-label">Transición</span>
          <select class="ov-transition" ...>
            <option value="">Global (${state.config.transition})</option>
            ...
          </select>
        </div>
        <div class="ov-row">
          <span class="ov-label">Dur. transición ...
```
Add immediately after the closing `</div>` of the transition row and before the duration row:
```javascript
        <div class="ov-row">
          <span class="ov-label">Efecto</span>
          <select class="ov-effect" style="background:var(--s3);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:3px 6px;font-size:12px;font-family:var(--sans)">
            <option value="">Global (${state.config.slideEffect})</option>
            ${['none','zoom-in','zoom-out','pan-right','pan-left','pan-down','pan-up','ken-burns','ken-burns-rev','random'].map(e =>
              `<option value="${e}"${ov.effect === e ? ' selected' : ''}>${e}</option>`
            ).join('')}
          </select>
        </div>
```

- [ ] **Step 2: Add event listener for `.ov-effect` select**

Find the transition override listener in `buildOverridePanel` (~line 3236):
```javascript
      panel.querySelector('.ov-transition').addEventListener('change', e => {
        slide.overrides.transition = e.target.value || null;
        renderThumbs();
        pushUndo(); debouncedSave();
      });
```
Add immediately after:
```javascript
      panel.querySelector('.ov-effect').addEventListener('change', e => {
        slide.overrides.effect = e.target.value || null;
        renderThumbs();
        pushUndo(); debouncedSave();
      });
```

- [ ] **Step 3: Update override badge detection**

Find the badge detection (~line 1261):
```javascript
        const hasOverrides = ov.duration || ov.transition || ov.transitionDuration || (ov.textMode && ov.textMode !== 'inherit');
```
Change to:
```javascript
        const hasOverrides = ov.duration || ov.transition || ov.transitionDuration || ov.effect || (ov.textMode && ov.textMode !== 'inherit');
```

- [ ] **Step 4: Visual verification**

Open `sequentia.html` in Firefox. Load 2+ images. Click the edit (✎) icon on a thumbnail — the override panel should show an "Efecto" select with "Global (none)" as default. Select "ken-burns" — the slide thumbnail badge should appear (✎ indicator). With global effect set to "Ninguno", that specific slide should show Ken Burns while others remain static. Confirm in playback.

- [ ] **Step 5: Commit**
```bash
git add sequentia.html
git commit -m "feat: per-slide effect override panel + badge detection"
```

---

## Final Verification Checklist

After all tasks, do a full manual test in Firefox:

- [ ] Efecto pills render in Composición panel, "Ninguno" active by default
- [ ] Selecting each effect pill updates playback in real time
- [ ] All 8 concrete effects are visually distinct during playback
- [ ] "Random" mode shows a different effect per slide
- [ ] Per-slide override works: one slide with "Ken Burns", others with "Ninguno"
- [ ] Override badge shows ✎ when slide has effect override
- [ ] "Eliminar todos los overrides" clears the effect override
- [ ] Transitions play correctly with no snap-back of motion (freeze at end position)
- [ ] Export in Firefox: motion effects visible in exported video
- [ ] Undo/redo restores effect state correctly
- [ ] Loading a saved project restores effect settings
- [ ] No console errors throughout
