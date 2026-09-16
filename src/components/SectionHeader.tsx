import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, fonts } from '../theme';
import { GameIcon } from './GameIcon';
import { GameIconName } from '../assets/gameIcons';

interface Props {
  title: string;
  subtitle?: string;
  icon?: GameIconName;
}

export function SectionHeader({ title, subtitle, icon }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        {icon && <GameIcon name={icon} size={20} color={theme.accent} />}
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: theme.text,
  },
  subtitle: {
    fontSize: 12,
    color: theme.textDim,
    marginTop: 2,
  },
});
