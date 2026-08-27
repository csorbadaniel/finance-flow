import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Records — FinanceFlow" },
      { name: "description", content: "Browse, filter and edit your logged income and expense records." },
      { property: "og:title", content: "Records — FinanceFlow" },
      { property: "og:description", content: "Browse, filter and edit your logged income and expense records." },
    ],
  }),
  component: RecordsPage,
});

function RecordsPage() {
  return (
    <AppShell title="Records">
      <p className="text-sm text-muted-foreground">Records list coming next.</p>
    </AppShell>
  );
}
