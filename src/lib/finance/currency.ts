/**
 * Currency preferences.
 *
 * The app is single-user and offline, so currency is a pure display preference:
 * stored amounts are never converted, only formatted differently.
 */

export type CurrencyCode = "HUF" | "EUR" | "USD" | "GBP";

export interface CurrencyOption {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
  /** Symbol placed after the amount (Hungarian style) instead of before. */
  suffix: boolean;
  decimals: 0 | 2;
}

export const CURRENCIES: readonly CurrencyOption[] = [
  { code: "HUF", label: "Hungarian forint", symbol: "Ft", locale: "hu-HU", suffix: true, decimals: 0 },
  { code: "EUR", label: "Euro", symbol: "€", locale: "de-DE", suffix: true, decimals: 2 },
  { code: "USD", label: "US dollar", symbol: "$", locale: "en-US", suffix: false, decimals: 2 },
  { code: "GBP", label: "British pound", symbol: "£", locale: "en-GB", suffix: false, decimals: 2 },
];

export const DEFAULT_CURRENCY: CurrencyCode = "HUF";

export function getCurrencyOption(code: CurrencyCode): CurrencyOption {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function getCurrencySymbol(code: CurrencyCode): string {
  return getCurrencyOption(code).symbol;
}

/** Formats an amount using the selected currency's locale and symbol placement. */
export function formatMoney(amount: number, code: CurrencyCode = DEFAULT_CURRENCY): string {
  const option = getCurrencyOption(code);
  const value = new Intl.NumberFormat(option.locale, {
    minimumFractionDigits: option.decimals,
    maximumFractionDigits: option.decimals,
  }).format(option.decimals === 0 ? Math.round(amount) : amount);
  return option.suffix ? `${value} ${option.symbol}` : `${option.symbol}${value}`;
}
