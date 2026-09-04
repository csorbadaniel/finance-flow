import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { financeStore, useFinance, useCurrencySymbol } from "@/lib/finance/useFinance";
import { getCategoryPath, getDefaultPurseId } from "@/lib/finance/selectors";
import type { TransactionType } from "@/lib/finance/types";

/** Returns today's date as YYYY-MM-DD. */
function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function QuickAddDialog() {
  const state = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [purseId, setPurseId] = useState(getDefaultPurseId(state) ?? "");
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setType("expense");
    setAmount("");
    setCategoryId("");
    setPurseId(getDefaultPurseId(state) ?? "");
    setDate(todayIso());
    setNote("");
    setError(null);
  };

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
      financeStore.addTransaction({ type, amount: parsedAmount, categoryId, purseId, date, note });
      toast.success("Record added");
      resetForm();
      setIsOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the record.");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        setIsOpen(next);
        // Always preselect the current default purse when opening.
        if (next) setPurseId(getDefaultPurseId(state) ?? "");
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          Add record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add record</DialogTitle>
          <DialogDescription>Log an income or expense in a few taps.</DialogDescription>
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
            <Label htmlFor="quick-add-amount">Amount ({currencySymbol})</Label>
            <Input
              id="quick-add-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-add-category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="quick-add-category">
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
            <Label htmlFor="quick-add-purse">Purse</Label>
            <Select value={purseId} onValueChange={setPurseId}>
              <SelectTrigger id="quick-add-purse">
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
            <Label htmlFor="quick-add-date">Date</Label>
            <Input
              id="quick-add-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quick-add-note">Note (optional)</Label>
            <Textarea
              id="quick-add-note"
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

          <DialogFooter>
            <Button type="submit">Save record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
