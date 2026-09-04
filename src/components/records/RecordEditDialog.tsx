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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCategoryPath } from "@/lib/finance/selectors";
import { useCurrencySymbol } from "@/lib/finance/useFinance";
import { financeStore } from "@/lib/finance/store";
import type { FinanceState, Transaction, TransactionType } from "@/lib/finance/types";

interface RecordEditDialogProps {
  state: FinanceState;
  transaction: Transaction | null;
  onClose: () => void;
}

export function RecordEditDialog({ state, transaction, onClose }: RecordEditDialogProps) {
  const currencySymbol = useCurrencySymbol();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [purseId, setPurseId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Sync the form whenever a different record is opened.
  useEffect(() => {
    if (!transaction) return;
    setType(transaction.type);
    setAmount(String(transaction.amount));
    setCategoryId(transaction.categoryId);
    setPurseId(transaction.purseId);
    setDate(transaction.date);
    setNote(transaction.note ?? "");
    setError(null);
    setIsConfirmingDelete(false);
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!categoryId) {
      setError("Choose a category.");
      return;
    }
    if (!purseId) {
      setError("Choose a purse.");
      return;
    }
    try {
      financeStore.updateTransaction(transaction.id, {
        type,
        amount: parsedAmount,
        categoryId,
        purseId,
        date,
        note,
      });
      toast.success("Record updated");
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the record.");
    }
  };

  const handleDelete = () => {
    financeStore.deleteTransaction(transaction.id);
    toast.success("Record deleted");
    onClose();
  };

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit record</DialogTitle>
          <DialogDescription>Record #{transaction.recordNumber}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Record type">
            {(["expense", "income"] as const).map((option) => (
              <Button
                key={option}
                type="button"
                variant={type === option ? "default" : "outline"}
                aria-pressed={type === option}
                onClick={() => setType(option)}
              >
                {option === "expense" ? "Expense" : "Income"}
              </Button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="record-edit-amount">Amount ({currencySymbol})</Label>
            <Input
              id="record-edit-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="record-edit-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="record-edit-category">
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                {state.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryPath(state, category.id)
                      .map((c) => c.name)
                      .join(" › ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="record-edit-purse">Purse</Label>
            <Select value={purseId} onValueChange={setPurseId}>
              <SelectTrigger id="record-edit-purse">
                <SelectValue placeholder="Choose a purse" />
              </SelectTrigger>
              <SelectContent>
                {state.purses.map((purse) => (
                  <SelectItem key={purse.id} value={purse.id}>
                    {purse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="record-edit-date">Date</Label>
            <Input
              id="record-edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="record-edit-note">Note (optional)</Label>
            <Textarea
              id="record-edit-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter className="gap-2 sm:justify-between">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete this record?</span>
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
                Delete record
              </Button>
            )}
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
