import { Card, CardContent } from "@/components/ui/card";
import { getMonthSummary } from "@/lib/finance/selectors";
import { useMoneyFormatter } from "@/lib/finance/useFinance";
import type { Transaction } from "@/lib/finance/types";

interface MonthSummaryCardProps {
  transactions: Transaction[];
}

export function MonthSummaryCard({ transactions }: MonthSummaryCardProps) {
  const money = useMoneyFormatter();
  const summary = getMonthSummary(transactions);

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Balance this month</p>
          <p
            className={
              summary.balance >= 0
                ? "text-3xl font-semibold tabular-nums text-foreground"
                : "text-3xl font-semibold tabular-nums text-destructive"
            }
            aria-label="Balance this month"
          >
            {money(summary.balance)}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted p-3">
            <dt className="text-xs text-muted-foreground">Income</dt>
            <dd className="text-lg font-medium tabular-nums">{money(summary.income)}</dd>
          </div>
          <div className="rounded-md bg-muted p-3">
            <dt className="text-xs text-muted-foreground">Expense</dt>
            <dd className="text-lg font-medium tabular-nums">{money(summary.expense)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
