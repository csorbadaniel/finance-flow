import { useSyncExternalStore } from "react";
import { financeStore } from "./store";
import { initialFinanceState } from "./mockData";
import type { FinanceState } from "./types";
import { formatMoney, getCurrencySymbol } from "./currency";

const getServerSnapshot = (): FinanceState => initialFinanceState;

export function useFinance(): FinanceState {
  return useSyncExternalStore(
    (l) => financeStore.subscribe(l),
    () => financeStore.getState(),
    getServerSnapshot,
  );
}

export { financeStore };

/**
 * Returns a formatter bound to the user's currency preference.
 * Use this instead of calling `formatMoney` with a hard-coded currency.
 */
export function useMoneyFormatter(): (amount: number) => string {
  const { currency } = useFinance();
  return (amount: number) => formatMoney(amount, currency);
}

/** Currency symbol for the active preference (for input labels etc.). */
export function useCurrencySymbol(): string {
  const { currency } = useFinance();
  return getCurrencySymbol(currency);
}
