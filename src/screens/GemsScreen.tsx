import React from 'react';
import { ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { useGameStore } from '../state/gameStore';
import { GEM_UPGRADES, gemUpgradeCost, relicGemCost } from '../data/gemUpgrades';
import { BOOSTS } from '../data/boosts';
import { relicMultiplier } from '../data/prestige';
import { GemUpgradeCard } from '../components/GemUpgradeCard';
import { BoostCard } from '../components/BoostCard';
import { SectionHeader } from '../components/SectionHeader';
import { GameIcon } from '../components/GameIcon';
import { theme, cardShadow, fonts } from '../theme';
import { formatNumber, formatPercent } from '../utils/format';

export function GemsScreen() {
  const gems = useGameStore((s) => s.gems);
  const gemUpgrades = useGameStore((s) => s.gemUpgrades);
  const relics = useGameStore((s) => s.relics);
  const boughtRelics = useGameStore((s) => s.boughtRelics);
  const lifetimeGems = useGameStore((s) => s.lifetimeGems);
  const activeBoosts = useGameStore((s) => s.activeBoosts);
  const buyGemUpgrade = useGameStore((s) => s.buyGemUpgrade);
  const buyRelic = useGameStore((s) => s.buyRelic);
  const buyBoost = useGameStore((s) => s.buyBoost);

  const now = Date.now();
  const relicCost = relicGemCost(boughtRelics);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.banner}>
        <GameIcon name="gems" size={30} color={theme.gem} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerValue}>{formatNumber(gems)} Gemas</Text>
          <Text style={styles.bannerText}>
            Encontradas ao quebrar minérios de gema. Tudo comprado aqui é permanente e{' '}
            <Text style={styles.bannerStrong}>sobrevive à ascensão</Text>.
          </Text>
          <Text style={styles.bannerDim}>Total já encontrado: {formatNumber(lifetimeGems)}</Text>
        </View>
      </View>

      <SectionHeader
        icon="sparkles"
        title="Poderes Permanentes"
        subtitle="Bônus muito mais fortes que os da árvore de ouro — e você nunca os perde."
      />
      {GEM_UPGRADES.map((def) => {
        const level = gemUpgrades[def.id] ?? 0;
        const cost = gemUpgradeCost(def, level);
        return (
          <GemUpgradeCard
            key={def.id}
            def={def}
            level={level}
            cost={cost}
            canAfford={gems >= cost && level < def.maxLevel}
            onBuy={() => buyGemUpgrade(def.id)}
          />
        );
      })}

      <SectionHeader
        icon="trophy"
        title="Relíquia Instantânea"
        subtitle="Compre uma Relíquia sem precisar chegar aos 10.000m e ascender."
      />
      <View style={styles.relicCard}>
        <View style={styles.relicInfo}>
          <Text style={styles.relicTitle}>+1 Relíquia</Text>
          <Text style={styles.relicDesc} numberOfLines={3}>
            Relíquias dão +{formatPercent(relicMultiplier(1) - 1)} de ouro e poder cada, para sempre. Você tem{' '}
            {formatNumber(relics)} (bônus atual +{formatPercent(relicMultiplier(relics) - 1)}).
          </Text>
        </View>
        <Pressable
          style={[styles.relicBtn, gems < relicCost && styles.relicBtnDisabled]}
          onPress={buyRelic}
          disabled={gems < relicCost}
        >
          <Text style={styles.relicBtnLabel}>COMPRAR</Text>
          <View style={styles.priceRow}>
            <GameIcon name="gems" size={12} color="#1a1a1a" />
            <Text style={styles.relicBtnCost} numberOfLines={1}>
              {formatNumber(relicCost)}
            </Text>
          </View>
        </Pressable>
      </View>

      <SectionHeader
        icon="fire"
        title="Impulsos Temporários"
        subtitle="Baratos e imediatos, para empurrar uma camada difícil agora."
      />
      {BOOSTS.map((b) => (
        <BoostCard
          key={b.id}
          boost={b}
          active={(activeBoosts[b.id] ?? 0) > now}
          canAfford={gems >= b.cost}
          onBuy={() => buyBoost(b.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(127,216,255,0.35)',
    padding: 14,
    margin: 16,
    marginBottom: 0,
    ...cardShadow,
  },
  bannerValue: {
    fontFamily: fonts.display,
    color: theme.gem,
    fontSize: 18,
  },
  bannerText: {
    color: theme.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  bannerStrong: {
    color: theme.text,
  },
  bannerDim: {
    color: theme.textDim,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.8,
  },
  relicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(142,107,255,0.4)',
    ...cardShadow,
  },
  relicInfo: {
    flex: 1,
    marginRight: 8,
  },
  relicTitle: {
    fontFamily: fonts.display,
    color: theme.accent,
    fontSize: 14,
  },
  relicDesc: {
    color: theme.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  relicBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 92,
  },
  relicBtnDisabled: {
    opacity: 0.4,
  },
  relicBtnLabel: {
    fontFamily: fonts.display,
    color: '#1a1a1a',
    fontSize: 11,
  },
  relicBtnCost: {
    fontFamily: fonts.display,
    color: '#1a1a1a',
    fontSize: 11,
  },
});
