import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import { BlockState } from '../types';
import { Block } from './Block';
import { GRID_COLS, GRID_ROWS, MINE_RADIUS_FACTOR } from '../state/gameStore';
import { theme } from '../theme';
import { haptics } from '../utils/haptics';

const MINE_TICK_MS = 150;
const MIN_CELL_SIZE = 32;

interface Props {
  grid: BlockState[];
  onMineArea: (x: number, y: number, cellSize: number) => void;
}

export function MineGrid({ grid, onMineArea }: Props) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [reach, setReach] = useState<{ x: number; y: number } | null>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const size = useMemo(() => {
    if (box.width === 0 || box.height === 0) return 0;
    const byWidth = Math.floor(box.width / GRID_COLS);
    const byHeight = Math.floor(box.height / GRID_ROWS);
    return Math.max(MIN_CELL_SIZE, Math.min(byWidth, byHeight));
  }, [box]);

  const stopMining = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    posRef.current = null;
    setReach(null);
  }, []);

  const startMining = useCallback(
    (x: number, y: number) => {
      posRef.current = { x, y };
      setReach({ x, y });
      haptics.tap();
      onMineArea(x, y, size);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (posRef.current) onMineArea(posRef.current.x, posRef.current.y, size);
      }, MINE_TICK_MS);
    },
    [onMineArea, size]
  );

  const updatePosition = useCallback((x: number, y: number) => {
    posRef.current = { x, y };
    setReach({ x, y });
  }, []);

  useEffect(() => stopMining, [stopMining]);

  const handleGrant = (e: GestureResponderEvent) => {
    startMining(e.nativeEvent.locationX, e.nativeEvent.locationY);
  };
  const handleMove = (e: GestureResponderEvent) => {
    updatePosition(e.nativeEvent.locationX, e.nativeEvent.locationY);
  };

  const rows = new Map<number, BlockState[]>();
  for (const block of grid) {
    const arr = rows.get(block.row) ?? [];
    arr.push(block);
    rows.set(block.row, arr);
  }
  const sortedRows = [...rows.entries()].sort((a, b) => a[0] - b[0]);

  const radiusPx = size * MINE_RADIUS_FACTOR;

  return (
    <View
      style={styles.outer}
      onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {size > 0 && (
        <View
          style={{ width: size * GRID_COLS, height: size * GRID_ROWS }}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={handleGrant}
          onResponderMove={handleMove}
          onResponderRelease={stopMining}
          onResponderTerminate={stopMining}
        >
          {sortedRows.map(([row, blocks]) => (
            <View key={row} style={styles.row}>
              {blocks
                .sort((a, b) => a.col - b.col)
                .map((block) => (
                  <Block key={block.id} block={block} size={size} />
                ))}
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
  reach: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
});
