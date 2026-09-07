import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { CurrencyPreference } from "@/components/settings/CurrencyPreference";
import { DataTransfer } from "@/components/settings/DataTransfer";
import { OnboardingRestart } from "@/components/settings/OnboardingRestart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_BUILD_DATE, APP_NAME, APP_VERSION } from "@/lib/appInfo";

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
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyPreference />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Data</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTransfer />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Getting started</CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingRestart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">App</dt>
                <dd className="font-medium">{APP_NAME}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Version</dt>
                <dd className="font-medium tabular-nums">{APP_VERSION}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Build date</dt>
                <dd className="font-medium tabular-nums">{APP_BUILD_DATE}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Your data is stored on this device only.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
