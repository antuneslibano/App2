import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { DroneDef } from '../types';
import { DRONES } from '../data/drones';
import { GRID_COLS, useGameStore } from '../state/gameStore';
import { fonts } from '../theme';
import { GameIcon } from './GameIcon';

interface Props {
  cellSize: number;
}

/**
 * Renders one sprite per owned drone, hovering over the block that drone is actually
 * mining. The store assigns each drone its own target, so the swarm spreads over the
 * layer instead of stacking on one cell.
 */
export function DroneSwarm({ cellSize }: Props) {
  // Targets are grid indices, so the swarm never has to look at the grid array — it only
  // re-renders when a drone actually switches block, not on every swing.
  const drones = useGameStore((s) => s.drones);
  const droneTargets = useGameStore((s) => s.droneTargets);

  if (cellSize === 0) return null;
  const owned = DRONES.filter((d) => (drones[d.id] ?? 0) > 0);
  if (owned.length === 0) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {owned.map((drone) => {
        const index = droneTargets[drone.id];
        const hasTarget = index !== undefined && index >= 0;
        return (
          <DroneSprite
            key={drone.id}
            drone={drone}
            level={drones[drone.id] ?? 0}
            row={hasTarget ? Math.floor(index / GRID_COLS) : undefined}
            col={hasTarget ? index % GRID_COLS : undefined}
            cellSize={cellSize}
          />
        );
      })}
    </View>
  );
}

interface SpriteProps {
  drone: DroneDef;
  level: number;
  row?: number;
  col?: number;
  cellSize: number;
}

function DroneSprite({ drone, level, row, col, cellSize }: SpriteProps) {
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const bob = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);

  const iconSize = Math.max(16, Math.round(cellSize * 0.42));
  const active = row !== undefined && col !== undefined;

  useEffect(() => {
    // Each tier hovers at its own rhythm, so the swarm doesn't pulse in lockstep.
    const half = 700 + drone.tier * 90;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: half, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [bob, drone.tier]);

  useEffect(() => {
    if (row === undefined || col === undefined) return;
    const toValue = { x: col * cellSize, y: row * cellSize };
    if (!placed.current) {
      // First placement snaps; afterwards the drone visibly flies to its next block.
      pos.setValue(toValue);
      placed.current = true;
      return;
    }
    Animated.spring(pos, { toValue, friction: 7, tension: 45, useNativeDriver: true }).start();
  }, [row, col, cellSize, pos]);

  if (!active) return null;

  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -cellSize * 0.09] });
  const beamOpacity = bob.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.15] });
  const tilt = bob.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] });
  // Fan the tiers out horizontally so two drones sharing a block stay readable.
  const laneOffset = (drone.tier - 3) * (iconSize * 0.28);

  return (
    <Animated.View
      style={[
        styles.cell,
        { width: cellSize, height: cellSize, transform: [{ translateX: pos.x }, { translateY: pos.y }] },
      ]}
    >
      {/* Mining beam: a child of the cell, which has a known width, so it can be centered. */}
      <Animated.View
        style={[
          styles.beam,
          {
            left: cellSize / 2 - 1 + laneOffset,
            top: iconSize * 0.62,
            height: cellSize * 0.4,
            backgroundColor: drone.color,
            opacity: beamOpacity,
          },
        ]}
      />
      <Animated.View style={[styles.hover, { marginLeft: laneOffset, transform: [{ translateY: bobY }] }]}>
        <Animated.View style={{ transform: [{ rotate: tilt }] }}>
          <GameIcon name={drone.icon} size={iconSize} color={drone.color} />
        </Animated.View>
        {level > 1 && (
          <View style={[styles.badge, { borderColor: drone.color }]}>
            <Text style={[styles.badgeText, { color: drone.color }]} numberOfLines={1}>
              {level}
            </Text>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cell: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
  },
  hover: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  beam: {
    position: 'absolute',
    width: 2,
    borderRadius: 1,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    minWidth: 13,
    paddingHorizontal: 2,
    borderRadius: 7,
    borderWidth: 1,
    backgroundColor: 'rgba(10,12,18,0.9)',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: fonts.display,
    fontSize: 8,
  },
});
