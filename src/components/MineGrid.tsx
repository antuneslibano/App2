import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { BlockState } from '../types';
import { Block } from './Block';
import { GRID_COLS } from '../state/gameStore';

interface Props {
  grid: BlockState[];
  onMine: (id: string) => void;
}

export function MineGrid({ grid, onMine }: Props) {
  const { width } = useWindowDimensions();
  const size = Math.floor((Math.min(width, 480) - 16) / GRID_COLS);

  const rows = new Map<number, BlockState[]>();
  for (const block of grid) {
    const arr = rows.get(block.row) ?? [];
    arr.push(block);
    rows.set(block.row, arr);
  }
  const sortedRows = [...rows.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <View style={styles.container}>
      {sortedRows.map(([row, blocks]) => (
        <View key={row} style={styles.row}>
          {blocks
            .sort((a, b) => a.col - b.col)
            .map((block) => (
              <Block key={block.id} block={block} size={size} onPress={onMine} />
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
  },
});
