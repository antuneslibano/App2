import { BlockState, OreId } from '../types';

export const GRID_ROWS = 7;
export const GRID_COLS = 5;
export const GRID_SIZE = GRID_ROWS * GRID_COLS;
/** Gap between the cell bounds and the drawn block, in px. Shared with the hit test. */
export const BLOCK_PADDING = 3;

/** Slot a (row, col) occupies in the fixed-length grid array. */
export function blockIndex(row: number, col: number): number {
  return row * GRID_COLS + col;
}

/**
 * Indices of every block the reach circle overlaps — not just the one under the finger.
 * The test is circle-vs-rectangle against the block's *drawn* bounds (the cell minus its
 * padding), so what gets mined is exactly what the circle visibly covers.
 *
 * Only the rows and columns the circle's bounding box spans are examined, and a row whose
 * vertical distance already exceeds the radius is skipped whole.
 */
export function indicesWithinRadius(
  grid: (BlockState | null)[],
  x: number,
  y: number,
  cellSize: number,
  radiusPx: number
): number[] {
  const radiusSq = radiusPx * radiusPx;
  const minCol = Math.max(0, Math.floor((x - radiusPx) / cellSize));
  const maxCol = Math.min(GRID_COLS - 1, Math.floor((x + radiusPx) / cellSize));
  const minRow = Math.max(0, Math.floor((y - radiusPx) / cellSize));
  const maxRow = Math.min(GRID_ROWS - 1, Math.floor((y + radiusPx) / cellSize));

  const hits: number[] = [];
  for (let row = minRow; row <= maxRow; row++) {
    const top = row * cellSize + BLOCK_PADDING;
    const bottom = top + cellSize - BLOCK_PADDING * 2;
    const ny = y < top ? top : y > bottom ? bottom : y;
    const dy = ny - y;
    const dySq = dy * dy;
    if (dySq > radiusSq) continue;
    for (let col = minCol; col <= maxCol; col++) {
      const i = blockIndex(row, col);
      const block = grid[i];
      if (!block || block.deadAt) continue;
      const left = col * cellSize + BLOCK_PADDING;
      const right = left + cellSize - BLOCK_PADDING * 2;
      const nx = x < left ? left : x > right ? right : x;
      const dx = nx - x;
      if (dx * dx + dySq <= radiusSq) hits.push(i);
    }
  }
  return hits;
}

/** Of the blocks in range, the one whose center is closest to the touch point. */
export function nearestTarget(targets: number[], x: number, y: number, cellSize: number): number {
  let best = targets[0];
  let bestDist = Infinity;
  for (const i of targets) {
    const dx = ((i % GRID_COLS) + 0.5) * cellSize - x;
    const dy = (Math.floor(i / GRID_COLS) + 0.5) * cellSize - y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

/** How many of each ore are still standing, for the layer legend. */
export function countLayerOres(grid: (BlockState | null)[]): Partial<Record<OreId, number>> {
  const counts: Partial<Record<OreId, number>> = {};
  for (const b of grid) {
    if (!b || b.deadAt) continue;
    counts[b.ore] = (counts[b.ore] ?? 0) + 1;
  }
  return counts;
}
