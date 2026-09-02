import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { financeStore } from "@/lib/finance/store";
import type { FinanceState, Purse } from "@/lib/finance/types";

export type PurseDialogMode = { kind: "create" } | { kind: "edit"; purse: Purse };

interface PurseEditDialogProps {
  state: FinanceState;
  mode: PurseDialogMode | null;
  onClose: () => void;
}

export function PurseEditDialog({ state, mode, onClose }: PurseEditDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Sync the form whenever a different purse (or mode) is opened.
  useEffect(() => {
    if (!mode) return;
    setName(mode.kind === "edit" ? mode.purse.name : "");
    setError(null);
    setIsConfirmingDelete(false);
  }, [mode]);

  if (!mode) return null;

  const isEditing = mode.kind === "edit";
  const recordCount = isEditing
    ? state.transactions.filter((t) => t.purseId === mode.purse.id).length
    : 0;
  const isLastPurse = state.purses.length <= 1;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (isEditing) {
        financeStore.renamePurse(mode.purse.id, name);
        toast.success("Purse updated");
      } else {
        financeStore.addPurse(name);
        toast.success("Purse added");
      }
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the purse.");
    }
  };

  const handleDelete = () => {
    if (!isEditing) return;
    try {
      financeStore.deletePurse(mode.purse.id);
      toast.success("Purse deleted");
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the purse.");
    }
  };

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit purse" : "Add purse"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `${recordCount} record${recordCount === 1 ? "" : "s"} use this purse.`
              : "Purses group records by wallet, card or account."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="purse-name">Purse name</Label>
            <Input
              id="purse-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cash"
              autoFocus
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            {isEditing && !isLastPurse ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Records move to the default purse.
                  </span>
                  <Button type="button" variant="destructive" onClick={handleDelete}>
                    Confirm delete
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfirmingDelete(true)}
                >
                  Delete purse
                </Button>
              )
            ) : (
              <span />
            )}
            <Button type="submit">{isEditing ? "Save changes" : "Add purse"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
