import { useSyncExternalStore } from "react";
import { financeStore } from "./store";
import { initialFinanceState } from "./mockData";
import type { FinanceState } from "./types";

const getServerSnapshot = (): FinanceState => initialFinanceState;

export function useFinance(): FinanceState {
  return useSyncExternalStore(
    (l) => financeStore.subscribe(l),
    () => financeStore.getState(),
    getServerSnapshot,
  );
}

export { financeStore };
