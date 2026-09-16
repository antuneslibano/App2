import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { GAME_ICONS, GameIconName, ICON_VIEWBOX } from '../assets/gameIcons';

interface Props {
  name: GameIconName;
  size?: number;
  color?: string;
}

function GameIconComponent({ name, size = 24, color = '#ffffff' }: Props) {
  const paths = GAME_ICONS[name];
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}>
      {paths.map((d, i) => (
        <Path key={i} d={d} fill={color} />
      ))}
    </Svg>
  );
}

export const GameIcon = React.memo(GameIconComponent);
