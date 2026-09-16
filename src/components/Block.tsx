import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BlockState } from '../types';
import { OREMAP } from '../data/ores';
import { theme, fonts } from '../theme';
import { formatNumber } from '../utils/format';
import { haptics } from '../utils/haptics';
import { sfx } from '../utils/sfx';
import { GameIcon } from './GameIcon';

interface Props {
  block: BlockState;
  size: number;
}

const PARTICLE_ANGLES = [-70, -25, 25, 70, 180, -180];

function BlockComponent({ block, size }: Props) {
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
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 40, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.hp]);

  useEffect(() => {
    if (!isDead) return;
    if (block.reward?.crit) {
      haptics.crit();
      sfx.crit();
    } else {
      haptics.break();
      sfx.break();
    }
    Animated.parallel([
      Animated.timing(deathScale, { toValue: 1.1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
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

  const rotate = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-6deg', '6deg'] });

  // Order matters: a crit that lands on gem ore (or with a full bag) pays no gold,
  // so checking `crit` first would render a misleading "+0".
  const reward = block.reward;
  let rewardLabel = '';
  let rewardColor = theme.gold;
  if (reward?.bagFull) {
    rewardLabel = 'MOCHILA CHEIA';
    rewardColor = theme.textDim;
  } else if (reward && reward.gems > 0) {
    rewardLabel = `${reward.crit ? 'CRIT ' : ''}+${formatNumber(reward.gems)}`;
    rewardColor = theme.gem;
  } else if (reward) {
    rewardLabel = `${reward.crit ? 'CRIT ' : ''}+${formatNumber(reward.gold)}`;
    rewardColor = reward.crit ? theme.danger : theme.gold;
  }

  return (
    <View style={{ width: size, height: size, padding: 3 }} pointerEvents="none">
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
        <GameIcon name={ore.icon} size={Math.round(size * 0.46)} color="rgba(0,0,0,0.55)" />
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
            numberOfLines={1}
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
              <Animated.View
                key={i}
                pointerEvents="none"
                style={[
                  styles.particle,
                  {
                    backgroundColor: ore.color,
                    opacity: op,
                    transform: [{ translateX: tx }, { translateY: ty }],
                  },
                ]}
              />
            );
          })}
        </>
      )}
    </View>
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
    fontFamily: fonts.display,
    position: 'absolute',
    top: '30%',
    // Spills past the cell on purpose so long payouts aren't clipped by the cell's width.
    left: -24,
    right: -24,
    textAlign: 'center',
    fontSize: 12,
  },
  particle: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    width: 7,
    height: 7,
    borderRadius: 2,
  },
});
