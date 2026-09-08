import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavDrawer } from "@/components/layout/NavDrawer";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
        <Link to="/" className="text-base font-semibold tracking-tight">
          FinanceFlow
        </Link>
      </header>

      <NavDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">
              Continue without an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
