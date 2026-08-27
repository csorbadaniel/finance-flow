import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/purses")({
  head: () => ({
    meta: [
      { title: "Purses — FinanceFlow" },
      { name: "description", content: "Manage the wallets and accounts your records belong to." },
      { property: "og:title", content: "Purses — FinanceFlow" },
      { property: "og:description", content: "Manage the wallets and accounts your records belong to." },
    ],
  }),
  component: PursesPage,
});

function PursesPage() {
  return (
    <AppShell title="Purses">
      <p className="text-sm text-muted-foreground">Purse management coming soon.</p>
    </AppShell>
  );
}
