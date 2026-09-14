import { useState, type ReactNode } from "react";
import { Menu, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NavDrawer } from "./NavDrawer";

interface AppShellProps {
  title: string;
  children: ReactNode;
  /** Optional element rendered on the right side of the header. */
  headerAction?: ReactNode;
}

export function AppShell({ title, children, headerAction }: AppShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
        <div className="flex size-8 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary" aria-hidden="true">
          <WalletCards className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">FinanceFlow</p>
          <h1 className="truncate text-sm font-semibold">{title}</h1>
        </div>
        {headerAction}
        </div>
      </header>

      <NavDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
