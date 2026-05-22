export const SPECIAL_PAYMENT_LABELS = [
  'Fondo de previsión urbano',
  'Fondo de previsión interurbano',
];

export function mergePaymentOptions(optionNames: string[]): string[] {
  const normalized = new Set<string>();
  const merged: string[] = [];

  [...optionNames, ...SPECIAL_PAYMENT_LABELS].forEach((name) => {
    const value = (name || '').trim();
    if (!value) {
      return;
    }

    const key = value.toLowerCase();
    if (normalized.has(key)) {
      return;
    }

    normalized.add(key);
    merged.push(value);
  });

  return merged;
}
