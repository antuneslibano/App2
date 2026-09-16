import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import { BlockState } from '../types';
import { Block } from './Block';
import { GRID_COLS, GRID_ROWS, MINE_RADIUS_FACTOR } from '../state/gameStore';
import { theme } from '../theme';
import { haptics } from '../utils/haptics';
import { sfx } from '../utils/sfx';

const MINE_TICK_MS = 150;
const MIN_CELL_SIZE = 32;

interface Props {
  grid: BlockState[];
  onMineArea: (x: number, y: number, cellSize: number) => boolean;
}

export function MineGrid({ grid, onMineArea }: Props) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [reach, setReach] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentRef = useRef<View>(null);
  // Absolute window position of the grid. Touch coords are derived from pageX/pageY minus
  // this instead of nativeEvent.locationX/Y: those are relative to whatever view is under
  // the finger, which changes the instant a block is destroyed mid-hold and makes the
  // reach circle jump somewhere else.
  const originRef = useRef({ x: 0, y: 0 });

  const size = useMemo(() => {
    if (box.width === 0 || box.height === 0) return 0;
    const byWidth = Math.floor(box.width / GRID_COLS);
    const byHeight = Math.floor(box.height / GRID_ROWS);
    return Math.max(MIN_CELL_SIZE, Math.min(byWidth, byHeight));
  }, [box]);

  // Read from a ref inside the tick loop so a mid-hold layout re-measure can never
  // make the loop mine against a stale cell size that no longer matches what's on screen.
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const stopMining = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    posRef.current = null;
    setReach(null);
  }, []);

  const swing = useCallback(
    (x: number, y: number) => {
      if (onMineArea(x, y, sizeRef.current)) {
        haptics.tap();
        sfx.tap();
      }
    },
    [onMineArea]
  );

  const startMining = useCallback(
    (x: number, y: number) => {
      posRef.current = { x, y };
      setReach({ x, y });
      swing(x, y);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (posRef.current) swing(posRef.current.x, posRef.current.y);
      }, MINE_TICK_MS);
    },
    [swing]
  );

  const updatePosition = useCallback((x: number, y: number) => {
    posRef.current = { x, y };
    setReach({ x, y });
  }, []);

  useEffect(() => stopMining, [stopMining]);

  const measureOrigin = useCallback(() => {
    contentRef.current?.measureInWindow((x, y) => {
      if (Number.isFinite(x) && Number.isFinite(y)) originRef.current = { x, y };
    });
  }, []);

  const toLocal = (e: GestureResponderEvent) => ({
    x: e.nativeEvent.pageX - originRef.current.x,
    y: e.nativeEvent.pageY - originRef.current.y,
  });

  const handleGrant = (e: GestureResponderEvent) => {
    const { x, y } = toLocal(e);
    startMining(x, y);
  };
  const handleMove = (e: GestureResponderEvent) => {
    const { x, y } = toLocal(e);
    updatePosition(x, y);
  };

  // Keyed by "row-col" and rendered as fixed slots (see below) so a block's on-screen
  // position always matches row*size/col*size — the same math mineArea() uses to find
  // what's under the finger. Rendering only the *surviving* blocks per row in a plain
  // flex sequence (the previous approach) shifts everything left as neighbors are
  // mined out, silently breaking that alignment.
  const cellMap = useMemo(() => {
    const map = new Map<string, BlockState>();
    for (const block of grid) map.set(`${block.row}-${block.col}`, block);
    return map;
  }, [grid]);

  const radiusPx = size * MINE_RADIUS_FACTOR;

  return (
    <View
      style={styles.outer}
      onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {size > 0 && (
        <View
          ref={contentRef}
          onLayout={measureOrigin}
          style={{ width: size * GRID_COLS, height: size * GRID_ROWS }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleGrant}
          onResponderMove={handleMove}
          onResponderRelease={stopMining}
          onResponderTerminate={stopMining}
        >
          {Array.from({ length: GRID_ROWS }).map((_, row) => (
            <View key={row} style={styles.row}>
              {Array.from({ length: GRID_COLS }).map((_, col) => {
                const block = cellMap.get(`${row}-${col}`);
                return block ? (
                  <Block key={block.id} block={block} size={size} />
                ) : (
                  <View key={`hole-${row}-${col}`} style={{ width: size, height: size, padding: 3 }}>
                    <View style={styles.hole} />
                  </View>
                );
              })}
            </View>
          ))}
          {reach && (
            <View
              pointerEvents="none"
              style={[
                styles.reach,
                {
                  left: reach.x - radiusPx,
                  top: reach.y - radiusPx,
                  width: radiusPx * 2,
                  height: radiusPx * 2,
                  borderRadius: radiusPx,
                },
              ]}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  hole: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: theme.bg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  reach: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
