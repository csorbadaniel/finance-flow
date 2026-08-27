import { Link } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatHUF, getCategoryPath } from "@/lib/finance/selectors";
import type { FinanceState } from "@/lib/finance/types";

interface RecentTransactionsProps {
  state: FinanceState;
  limit?: number;
}

/** Formats an ISO date as YYYY/MM/DD. */
function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}/${month}/${day}`;
}

export function RecentTransactions({ state, limit = 5 }: RecentTransactionsProps) {
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Recent records</CardTitle>
        <Link to="/records" className="text-sm font-medium text-primary hover:underline">
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
                <li key={txn.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{leaf?.name ?? "Uncategorized"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(txn.date)}
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
        )}
      </CardContent>
    </Card>
  );
}
