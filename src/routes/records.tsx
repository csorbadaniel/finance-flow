import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { RecordFilters } from "@/components/records/RecordFilters";
import { RecordsList } from "@/components/records/RecordsList";
import {
  emptyTransactionFilters,
  filterTransactions,
  formatHUF,
  sumByType,
  type TransactionFilters,
} from "@/lib/finance/selectors";
import { useFinance } from "@/lib/finance/useFinance";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Records — FinanceFlow" },
      { name: "description", content: "Browse, filter and edit your logged income and expense records." },
      { property: "og:title", content: "Records — FinanceFlow" },
      { property: "og:description", content: "Browse, filter and edit your logged income and expense records." },
    ],
  }),
  component: RecordsPage,
});

function RecordsPage() {
  const state = useFinance();
  const [filters, setFilters] = useState<TransactionFilters>(emptyTransactionFilters);

  const visibleTransactions = filterTransactions(state, filters);
  const totals = sumByType(visibleTransactions);

  return (
    <AppShell title="Records">
      <div className="space-y-4">
        <RecordFilters state={state} filters={filters} onChange={setFilters} />

        <p className="px-1 text-xs text-muted-foreground" role="status">
          {visibleTransactions.length} record{visibleTransactions.length === 1 ? "" : "s"} · income{" "}
          {formatHUF(totals.income)} · expense {formatHUF(totals.expense)}
        </p>

        <RecordsList state={state} transactions={visibleTransactions} />
      </div>
    </AppShell>
  );
}
