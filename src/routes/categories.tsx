import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — FinanceFlow" },
      { name: "description", content: "Organize spending with a three-level category tree." },
      { property: "og:title", content: "Categories — FinanceFlow" },
      { property: "og:description", content: "Organize spending with a three-level category tree." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <AppShell title="Categories">
      <p className="text-sm text-muted-foreground">Category tree coming soon.</p>
    </AppShell>
  );
}
