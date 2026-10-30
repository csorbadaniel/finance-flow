import { financeStore } from "@/lib/finance/store";
import { initialFinanceState } from "@/test/fixtures/finance";

/** Test helper: restores the finance store to the mock starting data. */
export function resetFinanceStore(): void {
  financeStore.replaceData(initialFinanceState);
  financeStore.setOnboardingSeen(initialFinanceState.onboardingSeen);
}
