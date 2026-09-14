import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { appearanceStore, useAppearance, type Appearance } from "@/lib/appearance";

const options: Array<{ value: Appearance; label: string; icon: typeof Moon }> = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
];

export function AppearancePreference() {
  const appearance = useAppearance();

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Appearance</p>
      <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-muted p-1">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={appearance === option.value ? "secondary" : "ghost"}
            className="h-9 shadow-none"
            aria-pressed={appearance === option.value}
            onClick={() => appearanceStore.set(option.value)}
          >
            <option.icon aria-hidden="true" />
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}