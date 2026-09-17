import React from 'react';
import { Image, StyleProp, ImageStyle } from 'react-native';
import { SPRITES, SpriteName } from '../assets/sprites';

interface Props {
  name: SpriteName;
  size: number;
  color: string;
  style?: StyleProp<ImageStyle>;
}

/**
 * A grid icon. Deliberately an Image and not a <GameIcon> vector: the mine mounts 70 of
 * these, and React Native shares one decoded bitmap across every cell using the same ore,
 * where each SVG would parse its own path. `tintColor` keeps the per-block light/dark ink.
 */
function SpriteComponent({ name, size, color, style }: Props) {
  return (
    <Image
      source={SPRITES[name]}
      style={[{ width: size, height: size, tintColor: color }, style]}
      resizeMode="contain"
      fadeDuration={0}
    />
  );
}

export const Sprite = React.memo(SpriteComponent);
