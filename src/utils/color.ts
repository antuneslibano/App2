/** Tiny color helpers so block icons and labels stay readable on any ore color. */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** Perceived brightness, 0 (black) to 1 (white). */
export function brightness(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Near-black or near-white ink, whichever reads better on top of `hex`. */
export function inkOn(hex: string): string {
  return brightness(hex) > 0.55 ? '#16181f' : '#f7f9ff';
}

/** Mixes `hex` toward black (amount < 0) or white (amount > 0), by a 0..1 fraction. */
export function shade(hex: string, amount: number): string {
  const [r, g, b] = parseHex(hex);
  const target = amount > 0 ? 255 : 0;
  const t = Math.abs(amount);
  const mix = (c: number) => Math.round(c + (target - c) * t);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}
