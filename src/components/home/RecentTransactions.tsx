import { Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate, getCategoryPath } from "@/lib/finance/selectors";
import { useMoneyFormatter } from "@/lib/finance/useFinance";
import type { FinanceState } from "@/lib/finance/types";

interface RecentTransactionsProps {
  state: FinanceState;
  limit?: number;
}

export function RecentTransactions({ state, limit = 5 }: RecentTransactionsProps) {
  const money = useMoneyFormatter();
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border px-5 py-4">
        <CardTitle className="text-sm uppercase tracking-[0.12em] text-muted-foreground">Recent records</CardTitle>
        <Link to="/records" className="text-xs font-semibold text-primary hover:underline">
          See all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {recent.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No records yet. Add your first one to get started.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((txn) => {
              const path = getCategoryPath(state, txn.categoryId);
              const leaf = path[path.length - 1];
              return (
                <li key={txn.id} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{leaf?.name ?? "Uncategorized"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDisplayDate(txn.date)}
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
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
