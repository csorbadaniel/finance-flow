import {
  formatDisplayDate,
  formatHUF,
  formatMonthKey,
  getCategoryPath,
  groupByMonth,
  sumByType,
} from "@/lib/finance/selectors";
import type { FinanceState, Transaction } from "@/lib/finance/types";

interface RecordsListProps {
  state: FinanceState;
  transactions: Transaction[];
}

export function RecordsList({ state, transactions }: RecordsListProps) {
  if (transactions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No records match your filters.
      </p>
    );
  }

  const groups = groupByMonth(transactions);

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const totals = sumByType(group.items);
        return (
          <section key={group.monthKey} aria-label={`Records for ${formatMonthKey(group.monthKey)}`}>
            <header className="flex items-baseline justify-between px-1 pb-2">
              <h2 className="text-sm font-semibold tracking-tight">
                {formatMonthKey(group.monthKey)}
              </h2>
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatHUF(totals.balance)}
              </span>
            </header>

            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {group.items.map((txn) => {
                const path = getCategoryPath(state, txn.categoryId);
                const purse = state.purses.find((p) => p.id === txn.purseId);
                return (
                  <li key={txn.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {path.map((c) => c.name).join(" › ") || "Uncategorized"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        #{txn.recordNumber} · {formatDisplayDate(txn.date)}
                        {purse ? ` · ${purse.name}` : ""}
                        {txn.note ? ` · ${txn.note}` : ""}
                      </p>
                    </div>
                    <span
                      className={
                        txn.type === "income"
                          ? "shrink-0 text-sm font-semibold tabular-nums text-primary"
                          : "shrink-0 text-sm font-semibold tabular-nums text-foreground"
                      }
                    >
                      {txn.type === "income" ? "+" : "−"}
                      {formatHUF(txn.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
