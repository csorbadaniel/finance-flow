import { useState } from "react";
import { initialFinanceState } from "@/lib/finance/initialState";
import { financeStore } from "@/lib/finance/store";

/** Demo records are downloaded only on request and never replace personal records. */
export function useLoadDemoData() {
  const [isLoading, setIsLoading] = useState(false);

  const loadDemoData = async () => {
    setIsLoading(true);
    try {
      const { demoTransactions } = await import("./sampleRecords");
      // Recheck after the download: records may have changed while it was loading.
      const current = financeStore.getState();
      if (current.transactions.length > 0) {
        throw new Error("Demo data can only be added when this device has no records. Your data wasn't changed.");
      }
      const categories = [...current.categories, ...initialFinanceState.categories.filter(
        (category) => !current.categories.some((existing) => existing.id === category.id),
      )];
      const hasDefaultPurse = current.purses.some((purse) => purse.isDefault);
      const purses = [...current.purses, ...initialFinanceState.purses.filter(
        (purse) => !current.purses.some((existing) => existing.id === purse.id),
      ).map((purse) => ({ ...purse, isDefault: !hasDefaultPurse && purse.isDefault }))];
      financeStore.replaceData({ categories, purses, transactions: demoTransactions });
      return demoTransactions.length;
    } finally {
      setIsLoading(false);
    }
  };

  return { loadDemoData, isLoading };
}