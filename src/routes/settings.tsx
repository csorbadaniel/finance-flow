import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — FinanceFlow" },
      { name: "description", content: "App preferences, tutorial restart and version information." },
      { property: "og:title", content: "Settings — FinanceFlow" },
      { property: "og:description", content: "App preferences, tutorial restart and version information." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell title="Settings">
      <p className="text-sm text-muted-foreground">Settings coming soon.</p>
    </AppShell>
  );
}
