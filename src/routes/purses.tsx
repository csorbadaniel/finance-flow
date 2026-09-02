import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { PurseEditDialog, type PurseDialogMode } from "@/components/purses/PurseEditDialog";
import { PurseList } from "@/components/purses/PurseList";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFinance } from "@/lib/finance/useFinance";

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

export function PursesPage() {
  const state = useFinance();
  const [dialogMode, setDialogMode] = useState<PurseDialogMode | null>(null);

  return (
    <AppShell title="Purses">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Star a purse to preselect it on new records.
          </p>
          <Button size="sm" onClick={() => setDialogMode({ kind: "create" })}>
            <Plus className="mr-1 h-4 w-4" />
            Add purse
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <PurseList state={state} onEdit={(purse) => setDialogMode({ kind: "edit", purse })} />
          </CardContent>
        </Card>
      </div>

      <PurseEditDialog state={state} mode={dialogMode} onClose={() => setDialogMode(null)} />
    </AppShell>
  );
}
