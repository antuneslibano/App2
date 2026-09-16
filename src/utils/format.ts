const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp'];

export function formatNumber(value: number): string {
  if (value < 1000) return Math.floor(value).toString();
  const tier = Math.min(Math.floor(Math.log10(value) / 3), SUFFIXES.length - 1);
  const scaled = value / Math.pow(1000, tier);
  const formatted = scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2);
  return `${formatted}${SUFFIXES[tier]}`;
}

export function formatGold(value: number): string {
  return formatNumber(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
