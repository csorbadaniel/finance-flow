import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { RecordEditDialog } from "@/components/records/RecordEditDialog";
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
import type { Transaction } from "@/lib/finance/types";

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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const visibleTransactions = filterTransactions(state, filters);
  const totals = sumByType(visibleTransactions);

  // Keep the dialog in sync with the latest store state so edits and
  // deletions reflect immediately, even if the record changed elsewhere.
  const selected = selectedTransaction
    ? (state.transactions.find((t) => t.id === selectedTransaction.id) ?? null)
    : null;

  return (
    <AppShell title="Records">
      <div className="space-y-4">
        <RecordFilters state={state} filters={filters} onChange={setFilters} />

        <p className="px-1 text-xs text-muted-foreground" role="status">
          {visibleTransactions.length} record{visibleTransactions.length === 1 ? "" : "s"} · income{" "}
          {formatHUF(totals.income)} · expense {formatHUF(totals.expense)}
        </p>

        <RecordsList
          state={state}
          transactions={visibleTransactions}
          onSelectTransaction={setSelectedTransaction}
        />

        {selected ? (
          <RecordEditDialog
            state={state}
            transaction={selected}
            onClose={() => setSelectedTransaction(null)}
          />
        ) : null}
      </div>
    </AppShell>
  );
}
