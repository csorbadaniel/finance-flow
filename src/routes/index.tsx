import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { MonthSummaryCard } from "@/components/home/MonthSummaryCard";
import { QuickAddDialog } from "@/components/home/QuickAddDialog";
import { RecentTransactions } from "@/components/home/RecentTransactions";
import { useFinance } from "@/lib/finance/useFinance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinanceFlow — Personal finance tracker" },
      { name: "description", content: "Log income and expenses in seconds, then see exactly where your money goes." },
      { property: "og:title", content: "FinanceFlow — Personal finance tracker" },
      { property: "og:description", content: "Log income and expenses in seconds, then see exactly where your money goes." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const state = useFinance();

  return (
    <AppShell title="Home">
      <div className="space-y-4">
        <MonthSummaryCard transactions={state.transactions} />
        <QuickAddDialog />
        <RecentTransactions state={state} />
      </div>
    </AppShell>
  );
}
