import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BlockState } from '../types';
import { OREMAP } from '../data/ores';
import { BLOCK_PADDING } from '../state/gameStore';
import { theme, fonts } from '../theme';
import { formatNumber } from '../utils/format';
import { haptics } from '../utils/haptics';
import { sfx } from '../utils/sfx';
import { inkOn, shade } from '../utils/color';
import { GameIcon } from './GameIcon';

interface Props {
  block: BlockState;
  size: number;
}

const PARTICLE_ANGLES = [-60, -15, 25, 150];
/** Below this cell size the ore name is dropped — the icon alone has to carry it. */
const MIN_SIZE_FOR_LABEL = 46;
const STRIKE_MS = 260;
const DEATH_MS = 380;

/**
 * One block. Every visual it has is driven by exactly two Animated values — `strike` and
 * `death` — because a wide reach circle hits ~20 blocks at once, and each separate
 * `Animated.timing().start()` is its own JS-to-native call. Folding the shake, the squash,
 * the pickaxe, the spark, the payout label and the debris into two timings takes a swing
 * from ~120 animation starts down to ~20.
 */
function BlockComponent({ block, size }: Props) {
  const strike = useRef(new Animated.Value(0)).current;
  const death = useRef(new Animated.Value(0)).current;

  const ore = OREMAP[block.ore];
  const hpRatio = Math.max(0, block.hp / block.maxHp);
  const isDead = !!block.deadAt;
  const ink = inkOn(ore.color);
  const showLabel = size >= MIN_SIZE_FOR_LABEL;
  // The pickaxe and its spark only get mounted once this block has actually been struck,
  // so a freshly generated layer doesn't pay for 70 invisible SVGs up front.
  const everHit = block.lastHitAt !== undefined;

  useEffect(() => {
    if (!block.lastHitAt || isDead) return;
    strike.setValue(0);
    Animated.timing(strike, {
      toValue: 1,
      duration: STRIKE_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.lastHitAt]);

  useEffect(() => {
    if (!isDead) return;
    const crit = !!block.reward?.crit;
    if (crit) {
      haptics.crit();
    } else {
      haptics.break();
    }
    sfx.breakOre(ore.material, crit);
    Animated.timing(death, {
      toValue: 1,
      duration: DEATH_MS,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDead]);

  // --- everything below reads off those two values ---
  const strikeScale = strike.interpolate({ inputRange: [0, 0.1, 0.5, 1], outputRange: [1, 0.93, 1.03, 1] });
  const shake = strike.interpolate({
    inputRange: [0, 0.12, 0.3, 0.55, 1],
    outputRange: ['0deg', '-5deg', '5deg', '-2deg', '0deg'],
  });
  const deathScale = death.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const blockOpacity = death.interpolate({ inputRange: [0, 0.25, 1], outputRange: [1, 1, 0] });

  const pickRotate = strike.interpolate({ inputRange: [0, 0.45, 1], outputRange: ['-75deg', '15deg', '25deg'] });
  const pickX = strike.interpolate({ inputRange: [0, 0.45, 1], outputRange: [size * 0.3, 0, size * 0.06] });
  const pickY = strike.interpolate({ inputRange: [0, 0.45, 1], outputRange: [-size * 0.3, 0, -size * 0.04] });
  const pickOpacity = strike.interpolate({ inputRange: [0, 0.05, 0.6, 1], outputRange: [0, 1, 1, 0] });
  const sparkScale = strike.interpolate({ inputRange: [0, 0.42, 0.45, 1], outputRange: [0.2, 0.2, 1, 1.8] });
  const sparkOpacity = strike.interpolate({ inputRange: [0, 0.42, 0.55, 1], outputRange: [0, 0, 0.9, 0] });

  const rewardOpacity = death.interpolate({ inputRange: [0, 0.08, 0.7, 1], outputRange: [0, 1, 1, 0] });
  const rewardY = death.interpolate({ inputRange: [0, 1], outputRange: [0, -34] });

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

  const sparkSize = size * 0.46;

  return (
    <View style={{ width: size, height: size, padding: BLOCK_PADDING }} pointerEvents="none">
      <Animated.View
        style={[
          styles.block,
          {
            backgroundColor: ore.color,
            // Gem ore gets a bright rim so valuable cells are obvious at a glance.
            borderColor: ore.isGem ? shade(ore.color, 0.55) : 'rgba(0,0,0,0.3)',
            borderWidth: ore.isGem ? 2.5 : 2,
            transform: [{ scale: Animated.multiply(strikeScale, deathScale) }, { rotate: shake }],
            opacity: blockOpacity,
          },
        ]}
      >
        {/* A lighter top half fakes a lit face, which also separates similar ore colors. */}
        <View style={[styles.gloss, { backgroundColor: shade(ore.color, 0.16) }]} />
        <GameIcon name={ore.icon} size={Math.round(size * (showLabel ? 0.44 : 0.52))} color={ink} />
        {showLabel && (
          <Text
            style={[styles.oreLabel, { color: ink, fontSize: Math.max(7, Math.round(size * 0.135)) }]}
            numberOfLines={1}
          >
            {ore.short}
          </Text>
        )}
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

      {!isDead && everHit && (
        <>
          {/* A plain bordered circle rather than an SVG burst: this mounts on every block
              the circle covers, and react-native-svg is the expensive way to draw a ring. */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.spark,
              {
                width: sparkSize,
                height: sparkSize,
                borderRadius: sparkSize / 2,
                marginLeft: -sparkSize / 2,
                marginTop: -sparkSize / 2,
                opacity: sparkOpacity,
                transform: [{ scale: sparkScale }],
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pickWrap,
              {
                opacity: pickOpacity,
                transform: [{ translateX: pickX }, { translateY: pickY }, { rotate: pickRotate }],
              },
            ]}
          >
            <GameIcon name="warPick" size={Math.round(size * 0.58)} color="#ffe9b0" />
          </Animated.View>
        </>
      )}

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
          {PARTICLE_ANGLES.map((deg, i) => {
            const angle = (deg * Math.PI) / 180;
            const tx = death.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * size * 0.5] });
            const ty = death.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * size * 0.5] });
            const op = death.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] });
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

export const Block = BlockComponent;

const styles = StyleSheet.create({
  block: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
  },
  oreLabel: {
    fontFamily: fonts.display,
    marginTop: 1,
    letterSpacing: 0.3,
    opacity: 0.85,
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
  pickWrap: {
    position: 'absolute',
    top: '18%',
    left: '18%',
  },
  spark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderWidth: 2,
    borderColor: '#fff6d5',
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
