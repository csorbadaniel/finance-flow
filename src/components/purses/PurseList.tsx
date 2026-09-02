import { Pencil, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatHUF } from "@/lib/finance/selectors";
import { financeStore } from "@/lib/finance/store";
import type { FinanceState, Purse } from "@/lib/finance/types";

interface PurseListProps {
  state: FinanceState;
  onEdit: (purse: Purse) => void;
}

/** Net balance of a purse: incomes minus expenses. */
function getPurseBalance(state: FinanceState, purseId: string): number {
  return state.transactions
    .filter((t) => t.purseId === purseId)
    .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
}

export function PurseList({ state, onEdit }: PurseListProps) {
  const handleSetDefault = (purse: Purse) => {
    if (purse.isDefault) return;
    financeStore.setDefaultPurse(purse.id);
    toast.success(`${purse.name} is now the default purse`);
  };

  if (state.purses.length === 0) {
    return <p className="text-sm text-muted-foreground">No purses yet. Add your first one.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {state.purses.map((purse) => {
        const recordCount = state.transactions.filter((t) => t.purseId === purse.id).length;
        return (
          <li key={purse.id} className="flex items-center gap-2 py-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-pressed={purse.isDefault}
              aria-label={
                purse.isDefault
                  ? `${purse.name} is the default purse`
                  : `Set ${purse.name} as default purse`
              }
              onClick={() => handleSetDefault(purse)}
            >
              <Star
                className={`h-4 w-4 ${purse.isDefault ? "fill-primary text-primary" : "text-muted-foreground"}`}
                aria-hidden="true"
              />
            </Button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {purse.name}
                {purse.isDefault ? (
                  <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                    Default
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {recordCount} record{recordCount === 1 ? "" : "s"} ·{" "}
                {formatHUF(getPurseBalance(state, purse.id))}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              aria-label={`Edit ${purse.name}`}
              onClick={() => onEdit(purse)}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
