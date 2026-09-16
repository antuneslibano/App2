import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlockState } from '../types';
import { OREMAP } from '../data/ores';
import { theme } from '../theme';
import { formatNumber } from '../utils/format';
import { haptics } from '../utils/haptics';

interface Props {
  block: BlockState;
  size: number;
  onPress: (id: string) => void;
}

const PARTICLE_ANGLES = [-70, -25, 25, 70, 180, -180];

function BlockComponent({ block, size, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const deathScale = useRef(new Animated.Value(1)).current;
  const deathOpacity = useRef(new Animated.Value(1)).current;
  const rewardY = useRef(new Animated.Value(0)).current;
  const rewardOpacity = useRef(new Animated.Value(0)).current;
  const particles = useRef(PARTICLE_ANGLES.map(() => new Animated.Value(0))).current;

  const ore = OREMAP[block.ore];
  const hpRatio = Math.max(0, block.hp / block.maxHp);
  const isDead = !!block.deadAt;

  useEffect(() => {
    if (isDead) return;
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.hp]);

  useEffect(() => {
    if (!isDead) return;
    if (block.reward?.crit) {
      haptics.crit();
    } else {
      haptics.break();
    }
    Animated.parallel([
      Animated.timing(deathScale, { toValue: 1.25, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(deathOpacity, { toValue: 0, duration: 300, delay: 60, useNativeDriver: true }),
      Animated.timing(rewardOpacity, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(rewardY, { toValue: -34, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ...particles.map((p) =>
        Animated.timing(p, { toValue: 1, duration: 340, easing: Easing.out(Easing.quad), useNativeDriver: true })
      ),
    ]).start();
    const t = setTimeout(() => rewardOpacity.setValue(0), 340);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDead]);

  const handlePress = () => {
    if (isDead) return;
    haptics.tap();
    onPress(block.id);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 40, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
  };

  const rotate = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-6deg', '6deg'] });

  const rewardLabel = block.reward
    ? block.reward.crit
      ? `💥 +${formatNumber(block.reward.gold)}`
      : block.reward.gems > 0
      ? `+${formatNumber(block.reward.gems)} 💎`
      : block.reward.bagFull
      ? '🎒 cheia!'
      : `+${formatNumber(block.reward.gold)}`
    : '';
  const rewardColor = block.reward?.bagFull ? theme.textDim : block.reward?.crit ? theme.danger : theme.gold;

  return (
    <Pressable onPress={handlePress} style={{ width: size, height: size, padding: 3 }}>
      <Animated.View
        style={[
          styles.block,
          {
            backgroundColor: ore.color,
            transform: [{ scale: Animated.multiply(scale, deathScale) }, { rotate }],
            opacity: deathOpacity,
          },
        ]}
      >
        <Text style={styles.emoji}>{ore.emoji}</Text>
        {hpRatio < 0.66 && <View style={[styles.crack, styles.crackA, { opacity: 1 - hpRatio }]} />}
        {hpRatio < 0.33 && <View style={[styles.crack, styles.crackB, { opacity: 1 - hpRatio }]} />}
        <View style={styles.hpTrack}>
          <View
            style={[
              styles.hpFill,
              { width: `${hpRatio * 100}%`, backgroundColor: hpRatio > 0.3 ? theme.success : theme.danger },
            ]}
          />
        </View>
      </Animated.View>

      {isDead && (
        <>
          <Animated.Text
            style={[
              styles.rewardText,
              { color: rewardColor, opacity: rewardOpacity, transform: [{ translateY: rewardY }] },
            ]}
            pointerEvents="none"
          >
            {rewardLabel}
          </Animated.Text>
          {particles.map((p, i) => {
            const angle = (PARTICLE_ANGLES[i] * Math.PI) / 180;
            const tx = p.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * size * 0.5] });
            const ty = p.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * size * 0.5] });
            const op = p.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
            return (
              <Animated.Text
                key={i}
                pointerEvents="none"
                style={[
                  styles.particle,
                  { opacity: op, transform: [{ translateX: tx }, { translateY: ty }] },
                ]}
              >
                {ore.emoji}
              </Animated.Text>
            );
          })}
        </>
      )}
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
  crack: {
    position: 'absolute',
    width: '70%',
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  crackA: {
    top: '35%',
    transform: [{ rotate: '25deg' }],
  },
  crackB: {
    top: '58%',
    transform: [{ rotate: '-20deg' }],
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
  rewardText: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 12,
  },
  particle: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    fontSize: 14,
  },
});
