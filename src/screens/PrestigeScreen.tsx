import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { MIN_ASCEND_DEPTH, relicMultiplier, relicsForDepth } from '../data/prestige';
import { theme, cardShadow, fonts } from '../theme';
import { formatNumber, formatPercent } from '../utils/format';
import { SectionHeader } from '../components/SectionHeader';
import { GameIcon } from '../components/GameIcon';

export function PrestigeScreen() {
  const depth = useGameStore((s) => s.depth);
  const relics = useGameStore((s) => s.relics);
  const ascend = useGameStore((s) => s.ascend);

  const projected = relicsForDepth(depth);
  const canAscend = projected > 0;
  const currentMult = relicMultiplier(relics);
  const nextMult = relicMultiplier(relics + projected);

  const handleAscend = () => {
    Alert.alert(
      'Ascender à superfície?',
      `Você voltará à profundidade 0 com a picareta de madeira e perderá seu ouro e melhorias, mas ganhará ${formatNumber(
        projected
      )} Relíquias permanentes.\n\nSuas Gemas e tudo que você comprou com elas ficam intactos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ascender', style: 'destructive', onPress: ascend },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <SectionHeader
        icon="elevator"
        title="Ascensão"
        subtitle="Volte à superfície para converter sua profundidade em Relíquias permanentes. Gemas e poderes de gema nunca são perdidos."
      />
      <View style={styles.card}>
        <Text style={styles.row}>
          Profundidade atual: <Text style={styles.bold}>{formatNumber(depth)}m</Text>
        </Text>
        <Text style={styles.row}>
          Relíquias acumuladas: <Text style={[styles.bold, { color: theme.accent }]}>{formatNumber(relics)}</Text>
        </Text>
        <Text style={styles.row}>
          Bônus permanente atual: <Text style={styles.bold}>+{formatPercent(currentMult - 1)}</Text> ouro e poder
        </Text>
        <View style={styles.divider} />
        <Text style={styles.row}>
          Relíquias ao ascender agora: <Text style={[styles.bold, { color: theme.accent }]}>+{formatNumber(projected)}</Text>
        </Text>
        <Text style={styles.row}>
          Novo bônus: <Text style={styles.bold}>+{formatPercent(nextMult - 1)}</Text>
        </Text>
        {!canAscend && (
          <Text style={styles.hint}>
            Alcance {MIN_ASCEND_DEPTH.toLocaleString('pt-BR')}m de profundidade para poder ascender.
          </Text>
        )}
      </View>

      <Pressable style={[styles.ascendBtn, !canAscend && styles.ascendBtnDisabled]} onPress={handleAscend} disabled={!canAscend}>
        <GameIcon name="elevator" size={18} color={theme.text} />
        <Text style={styles.ascendText}>Ascender à Superfície</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.border,
    ...cardShadow,
  },
  row: {
    color: theme.textDim,
    fontSize: 13,
    marginBottom: 8,
  },
  bold: {
    fontFamily: fonts.display,
    color: theme.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 8,
  },
  hint: {
    color: theme.danger,
    fontSize: 12,
    marginTop: 4,
  },
  ascendBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.accent,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    ...cardShadow,
  },
  ascendBtnDisabled: {
    opacity: 0.4,
  },
  ascendText: {
    fontFamily: fonts.display,
    color: theme.text,
    fontSize: 15,
  },
});
