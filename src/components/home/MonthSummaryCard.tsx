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
    <Card className="overflow-hidden border-primary/20">
      <CardContent className="p-0">
        <div className="border-b border-border px-5 py-6 sm:px-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Balance this month</p>
          <p
            className={
              summary.balance >= 0
                ? "text-3xl font-semibold tabular-nums text-foreground sm:text-4xl"
                : "text-3xl font-semibold tabular-nums text-destructive sm:text-4xl"
            }
            aria-label="Balance this month"
          >
            {money(summary.balance)}
          </p>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-border bg-muted/30">
          <div className="px-5 py-4 sm:px-6">
            <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Income</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums text-primary">+{money(summary.income)}</dd>
          </div>
          <div className="px-5 py-4 sm:px-6">
            <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Expense</dt>
            <dd className="mt-1 text-base font-semibold tabular-nums">−{money(summary.expense)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
