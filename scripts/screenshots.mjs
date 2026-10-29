// Screenshots for docs/guide, from index.html served with `python -m http.server 4182` in the repository root.
// Firefox, muted. Run by hand when the interface changes: `node scripts/screenshots.mjs`.
// Needs Playwright (not a dependency of the project): set PLAYWRIGHT to the path of its index.mjs.
// The five sample slides are drawn on a canvas and written to a temporary folder.

import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const { firefox } = await import(process.env.PLAYWRIGHT ?? '@playwright/test');

const url = process.env.URL ?? 'http://127.0.0.1:4182/';
const out = 'docs/guide/img/';
const browser = await firefox.launch({ firefoxUserPrefs: { 'media.volume_scale': '0.0' } });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US' })).newPage();

await page.goto(url);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}start.png` });

const dir = mkdtempSync(join(tmpdir(), 'sequentia-'));
const files = [];
for (const [i, hue] of [20, 100, 190, 260, 320].entries()) {
  const data = await page.evaluate(([hue, i]) => {
    const c = document.createElement('canvas');
    c.width = 1920;
    c.height = 1080;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 1920, 1080);
    g.addColorStop(0, `hsl(${hue} 70% 45%)`);
    g.addColorStop(1, `hsl(${hue + 40} 70% 20%)`);
    x.fillStyle = g;
    x.fillRect(0, 0, 1920, 1080);
    x.fillStyle = 'rgba(255,255,255,.9)';
    x.font = '700 260px sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(String(i + 1), 960, 540);
    return c.toDataURL('image/png').split(',')[1];
  }, [hue, i]);
  const file = join(dir, `slide-${i + 1}.png`);
  writeFileSync(file, Buffer.from(data, 'base64'));
  files.push(file);
}

await page.locator('#fileInput').setInputFiles(files);
await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}workspace.png` });

// The slide's own settings: the pencil on the second slide.
await page.locator('.thumb').nth(1).hover();
await page.locator('.thumb-edit').nth(1).click();
await page.waitForTimeout(500);
await page.locator('#thumbList').screenshot({ path: `${out}slide-settings.png` });

await browser.close();
