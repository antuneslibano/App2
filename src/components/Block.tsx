import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlockState } from '../types';
import { OREMAP } from '../data/ores';
import { theme } from '../theme';

interface Props {
  block: BlockState;
  size: number;
  onPress: (id: string) => void;
}

function BlockComponent({ block, size, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const ore = OREMAP[block.ore];
  const hpRatio = Math.max(0, block.hp / block.maxHp);

  const handlePress = () => {
    onPress(block.id);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 40, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable onPress={handlePress} style={{ width: size, height: size, padding: 3 }}>
      <Animated.View
        style={[
          styles.block,
          {
            backgroundColor: ore.color,
            transform: [{ scale }],
          },
        ]}
      >
        <Text style={styles.emoji}>{ore.emoji}</Text>
        <View style={styles.hpTrack}>
          <View
            style={[
              styles.hpFill,
              { width: `${hpRatio * 100}%`, backgroundColor: hpRatio > 0.3 ? theme.success : theme.danger },
            ]}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export const Block = React.memo(BlockComponent, (prev, next) => {
  return prev.block.hp === next.block.hp && prev.block.id === next.block.id && prev.size === next.size;
});

const styles = StyleSheet.create({
  block: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 20,
  },
  hpTrack: {
    position: 'absolute',
    bottom: 3,
    left: 4,
    right: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
  },
  hpFill: {
    height: '100%',
  },
});
