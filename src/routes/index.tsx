import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

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
  return (
    <AppShell title="Home">
      <p className="text-sm text-muted-foreground">
        Monthly summary and quick entry come next.
      </p>
    </AppShell>
  );
}
