import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/charts")({
  head: () => ({
    meta: [
      { title: "Charts — FinanceFlow" },
      { name: "description", content: "Visualize where your money goes with guided category charts." },
      { property: "og:title", content: "Charts — FinanceFlow" },
      { property: "og:description", content: "Visualize where your money goes with guided category charts." },
    ],
  }),
  component: ChartsPage,
});

function ChartsPage() {
  return (
    <AppShell title="Charts">
      <p className="text-sm text-muted-foreground">Charts coming soon.</p>
    </AppShell>
  );
}
