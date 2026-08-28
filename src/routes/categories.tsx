import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import {
  CategoryEditDialog,
  type CategoryDialogMode,
} from "@/components/categories/CategoryEditDialog";
import { CategoryTree } from "@/components/categories/CategoryTree";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFinance } from "@/lib/finance/useFinance";

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

export function CategoriesPage() {
  const state = useFinance();
  const [dialogMode, setDialogMode] = useState<CategoryDialogMode | null>(null);

  return (
    <AppShell title="Categories">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Up to three levels: category, subcategory, and detail.
          </p>
          <Button size="sm" onClick={() => setDialogMode({ kind: "create", parent: null })}>
            <Plus className="mr-1 h-4 w-4" />
            Add category
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <CategoryTree
              state={state}
              onAddChild={(parent) => setDialogMode({ kind: "create", parent })}
              onEdit={(category) => setDialogMode({ kind: "edit", category })}
            />
          </CardContent>
        </Card>
      </div>

      <CategoryEditDialog state={state} mode={dialogMode} onClose={() => setDialogMode(null)} />
    </AppShell>
  );
}
