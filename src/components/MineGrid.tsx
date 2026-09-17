import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, GestureResponderEvent, StyleSheet, View } from 'react-native';
import { MaterialKind } from '../types';
import { Block } from './Block';
import {
  BLOCK_PADDING,
  GRID_COLS,
  GRID_ROWS,
  blockIndex,
  getMineRadiusFactor,
  useGameStore,
} from '../state/gameStore';
import { theme } from '../theme';
import { haptics } from '../utils/haptics';
import { sfx } from '../utils/sfx';
import { DroneSwarm } from './DroneSwarm';

const MINE_TICK_MS = 150;
const MIN_CELL_SIZE = 32;

// Hoisted so the render doesn't rebuild two throwaway arrays every time.
const ROWS = Array.from({ length: GRID_ROWS }, (_, i) => i);
const COLS = Array.from({ length: GRID_COLS }, (_, i) => i);

interface Props {
  onMineArea: (x: number, y: number, cellSize: number) => MaterialKind | null;
}

/**
 * One cell of the grid. It subscribes to its own slot of the fixed-length grid array, so a
 * swing that changes 6 blocks re-renders 6 cells — the grid itself never re-renders, and
 * untouched cells don't even run a memo comparison.
 */
const BlockCell = React.memo(function BlockCell({ index, size }: { index: number; size: number }) {
  const block = useGameStore((s) => s.grid[index]);
  if (!block) {
    return (
      <View style={{ width: size, height: size, padding: BLOCK_PADDING }}>
        <View style={styles.hole} />
      </View>
    );
  }
  return <Block block={block} size={size} />;
});

export function MineGrid({ onMineArea }: Props) {
  // The reach circle is drawn from the same number the hit test uses, so what the player
  // sees highlighted is exactly what the swing breaks.
  const radiusFactor = useGameStore(getMineRadiusFactor);
  const [box, setBox] = useState({ width: 0, height: 0 });
  // The circle follows the finger through an Animated value rather than component state:
  // touch-move fires ~60x a second, and re-rendering the grid that often just to move a
  // ring was pure overhead.
  const [holding, setHolding] = useState(false);
  const reachPos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const radiusRef = useRef(0);
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
    setHolding(false);
  }, []);

  const swing = useCallback(
    (x: number, y: number) => {
      const material = onMineArea(x, y, sizeRef.current);
      if (material) {
        haptics.tap();
        sfx.dig(material);
      }
    },
    [onMineArea]
  );

  const moveReach = useCallback(
    (x: number, y: number) => {
      posRef.current = { x, y };
      reachPos.setValue({ x: x - radiusRef.current, y: y - radiusRef.current });
    },
    [reachPos]
  );

  const startMining = useCallback(
    (x: number, y: number) => {
      moveReach(x, y);
      setHolding(true);
      swing(x, y);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (posRef.current) swing(posRef.current.x, posRef.current.y);
      }, MINE_TICK_MS);
    },
    [swing, moveReach]
  );

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
    moveReach(x, y);
  };

  const radiusPx = size * radiusFactor;
  radiusRef.current = radiusPx;

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
          {/* Fixed slots: a block's on-screen position always matches row*size/col*size, the
              same math the hit test uses to find what's under the finger. */}
          {ROWS.map((row) => (
            <View key={row} style={styles.row}>
              {COLS.map((col) => (
                <BlockCell key={col} index={blockIndex(row, col)} size={size} />
              ))}
            </View>
          ))}
          <DroneSwarm cellSize={size} />
          {holding && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.reach,
                {
                  width: radiusPx * 2,
                  height: radiusPx * 2,
                  borderRadius: radiusPx,
                  transform: [{ translateX: reachPos.x }, { translateY: reachPos.y }],
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
