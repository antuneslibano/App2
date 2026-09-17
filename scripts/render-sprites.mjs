/**
 * Rasterizes the icons the mine grid mounts into white-on-transparent PNGs, which the blocks
 * render through <Image> with a tintColor. One decoded bitmap is shared by every cell showing
 * that ore, instead of each cell parsing its own vector path.
 *
 * Needs the rasterizer: npm i --no-save @resvg/resvg-js
 * Run with: node scripts/render-sprites.mjs
 */
import { Resvg } from '@resvg/resvg-js';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONS, SPRITE_ICONS } from './icon-map.mjs';

const require = createRequire(import.meta.url);
const iconSet = require('@iconify-json/game-icons/icons.json');
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(root, 'assets', 'sprites');
mkdirSync(outDir, { recursive: true });

// Cells top out around 80dp; 192px covers a 3x screen with room to spare.
const SIZE = 192;
const viewBox = iconSet.width ?? 512;

let total = 0;
for (const name of SPRITE_ICONS) {
  const icon = iconSet.icons[ICONS[name]];
  if (!icon) throw new Error(`Unknown icon: ${name}`);
  const paths = [...icon.body.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}">` +
    paths.map((d) => `<path d="${d}" fill="#ffffff"/>`).join('') +
    `</svg>`;
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: SIZE } }).render().asPng();
  writeFileSync(join(outDir, `${name}.png`), png);
  total += png.length;
}
console.log(`Wrote ${SPRITE_ICONS.length} sprites (${(total / 1024).toFixed(0)} KB) to ${outDir}`);
