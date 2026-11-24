import { getCategoryById } from "@/lib/finance/selectors";
import { useMoneyFormatter } from "@/lib/finance/useFinance";
import type { FinanceState, Transaction } from "@/lib/finance/types";

interface Props {
  state: FinanceState;
  /** Already filtered and sorted by the caller. */
  transactions: Transaction[];
}

export function ChartRecordList({ state, transactions }: Props) {
  const money = useMoneyFormatter();
  return (
    <section aria-label="Matching records" className="space-y-2">
      <h3 className="text-sm font-semibold">Records ({transactions.length})</h3>
      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No records for this category in this period.</p>
      ) : (
        <ul className="divide-y divide-border border-y">
          {transactions.map((transaction) => (
            <li
              key={transaction.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm">
                  {getCategoryById(state, transaction.categoryId)?.name ?? "Unknown"}
                  {transaction.note && (
                    <span className="text-muted-foreground"> · {transaction.note}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">{transaction.date}</p>
              </div>
              <span
                className={`shrink-0 text-sm tabular-nums ${transaction.type === "income" ? "text-primary" : ""}`}
              >
                {money(transaction.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
