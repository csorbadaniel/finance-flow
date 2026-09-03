import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ChartResult } from "@/components/charts/ChartResult";
import { ChartWizard } from "@/components/charts/ChartWizard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ChartConfig } from "@/lib/finance/charts";
import { useFinance } from "@/lib/finance/useFinance";

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

export function ChartsPage() {
  const state = useFinance();
  const [config, setConfig] = useState<ChartConfig | null>(null);

  return (
    <AppShell title="Charts">
      <Card>
        <CardContent className="pt-6">
          {config === null ? (
            <ChartWizard onComplete={setConfig} />
          ) : (
            <div className="space-y-4">
              <ChartResult state={state} config={config} />
              <Button variant="outline" onClick={() => setConfig(null)}>
                Change selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
