import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

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
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-card px-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu className="size-5" aria-hidden="true" />
        </Button>
        <h1 className="flex-1 truncate text-base font-semibold tracking-tight">{title}</h1>
        {headerAction}
      </header>

      <NavDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">{children}</main>
    </div>
  );
}
