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
import { getCategoryPath } from "@/lib/finance/selectors";
import { financeStore } from "@/lib/finance/store";
import type { Category, FinanceState } from "@/lib/finance/types";

/** Either create a child of `parent` (null = top level) or rename `category`. */
export type CategoryDialogMode =
  | { kind: "create"; parent: Category | null }
  | { kind: "edit"; category: Category };

interface CategoryEditDialogProps {
  state: FinanceState;
  mode: CategoryDialogMode | null;
  onClose: () => void;
}

export function CategoryEditDialog({ state, mode, onClose }: CategoryEditDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!mode) return;
    setName(mode.kind === "edit" ? mode.category.name : "");
    setError(null);
    setIsConfirmingDelete(false);
  }, [mode]);

  if (!mode) return null;

  const isEdit = mode.kind === "edit";
  const parentLabel =
    mode.kind === "create" && mode.parent
      ? getCategoryPath(state, mode.parent.id)
          .map((c) => c.name)
          .join(" › ")
      : null;

  const descendantCount = isEdit
    ? financeStore.getCategoryDescendants(mode.category.id).length - 1
    : 0;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (isEdit) {
        financeStore.renameCategory(mode.category.id, name);
        toast.success("Category renamed");
      } else {
        financeStore.addCategory({ name, parentId: mode.parent?.id ?? null });
        toast.success("Category added");
      }
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    }
  };

  const handleDelete = () => {
    if (!isEdit) return;
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    try {
      financeStore.deleteCategory(mode.category.id);
      toast.success("Category deleted");
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Rename this category or delete it with all its subcategories."
              : parentLabel
                ? `New subcategory under ${parentLabel}.`
                : "New top-level category."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              autoFocus
              onChange={(event) => setName(event.target.value)}
              placeholder="For example, groceries"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {isEdit && isConfirmingDelete && (
            <p role="alert" className="text-sm text-destructive">
              {descendantCount > 0
                ? `This also deletes ${descendantCount} subcategories. Records move to the parent category.`
                : "Records in this category move to the parent category."}
            </p>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {isEdit ? (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                {isConfirmingDelete ? "Confirm delete" : "Delete category"}
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit">{isEdit ? "Save changes" : "Add category"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
