import { createFileRoute } from "@tanstack/react-router";

import { ChartExplorer } from "@/components/charts/ChartExplorer";
import { AppShell } from "@/components/layout/AppShell";
import { useFinance } from "@/lib/finance/useFinance";

export const Route = createFileRoute("/charts")({
  head: () => ({
    meta: [
      { title: "Charts — FinanceFlow" },
      {
        name: "description",
        content:
          "Explore daily income, expenses and balance with custom dates and category drill-downs.",
      },
      { property: "og:title", content: "Charts — FinanceFlow" },
      {
        property: "og:description",
        content:
          "Explore daily income, expenses and balance with custom dates and category drill-downs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChartsPage,
});

export function ChartsPage() {
  const state = useFinance();
  return (
    <AppShell title="Charts">
      <ChartExplorer state={state} />
    </AppShell>
  );
}
