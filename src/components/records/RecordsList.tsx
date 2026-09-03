import {
  formatDisplayDate,
  formatMonthKey,
  getCategoryPath,
  groupByMonth,
  sumByType,
} from "@/lib/finance/selectors";
import type { FinanceState, Transaction } from "@/lib/finance/types";
import { useMoneyFormatter } from "@/lib/finance/useFinance";

interface RecordsListProps {
  state: FinanceState;
  transactions: Transaction[];
  onSelectTransaction?: (transaction: Transaction) => void;
}

export function RecordsList({ state, transactions, onSelectTransaction }: RecordsListProps) {
  const money = useMoneyFormatter();
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
                {money(totals.balance)}
              </span>
            </header>

            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {group.items.map((txn) => {
                const path = getCategoryPath(state, txn.categoryId);
                const purse = state.purses.find((p) => p.id === txn.purseId);
                const categoryLabel = path.map((c) => c.name).join(" › ") || "Uncategorized";
                return (
                  <li key={txn.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={`Edit record #${txn.recordNumber}, ${categoryLabel}, ${
                        txn.type === "income" ? "income" : "expense"
                      } of ${money(txn.amount)}`}
                      onClick={() => onSelectTransaction?.(txn)}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{categoryLabel}</p>
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
                        {money(txn.amount)}
                      </span>
                    </button>
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
