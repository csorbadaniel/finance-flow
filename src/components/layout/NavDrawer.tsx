import { Link } from "@tanstack/react-router";
import {
  Home,
  ListOrdered,
  PieChart,
  FolderTree,
  Wallet,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AccountSection } from "@/components/auth/AccountSection";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Home", to: "/", icon: Home },
  { label: "Records", to: "/records", icon: ListOrdered },
  { label: "Charts", to: "/charts", icon: PieChart },
  { label: "Categories", to: "/categories", icon: FolderTree },
  { label: "Purses", to: "/purses", icon: Wallet },
  { label: "Settings", to: "/settings", icon: Settings },
];

interface NavDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NavDrawer({ isOpen, onOpenChange }: NavDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-lg tracking-tight">FinanceFlow</SheetTitle>
          <SheetDescription className="text-xs">
            Track income, expenses and purses
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Main navigation" className="p-3">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => onOpenChange(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <AccountSection onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}
