import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  emptyTransactionFilters,
  formatMonthKey,
  getAvailableMonths,
  getCategoryPath,
  type TransactionFilters,
} from "@/lib/finance/selectors";
import type { FinanceState } from "@/lib/finance/types";

interface RecordFiltersProps {
  state: FinanceState;
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function RecordFilters({ state, filters, onChange }: RecordFiltersProps) {
  const months = getAvailableMonths(state);
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(emptyTransactionFilters);

  const update = (patch: Partial<TransactionFilters>) => onChange({ ...filters, ...patch });

  return (
    <section aria-label="Record filters" className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1.5">
        <Label htmlFor="records-search">Search</Label>
        <Input
          id="records-search"
          type="search"
          placeholder="Note, category or amount"
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="records-type">Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => update({ type: value as TransactionFilters["type"] })}
          >
            <SelectTrigger id="records-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="records-month">Month</Label>
          <Select value={filters.month} onValueChange={(value) => update({ month: value })}>
            <SelectTrigger id="records-month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {months.map((monthKey) => (
                <SelectItem key={monthKey} value={monthKey}>
                  {formatMonthKey(monthKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="records-category">Category</Label>
          <Select value={filters.categoryId} onValueChange={(value) => update({ categoryId: value })}>
            <SelectTrigger id="records-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
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
          <Label htmlFor="records-purse">Purse</Label>
          <Select value={filters.purseId} onValueChange={(value) => update({ purseId: value })}>
            <SelectTrigger id="records-purse">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All purses</SelectItem>
              {state.purses.map((purse) => (
                <SelectItem key={purse.id} value={purse.id}>
                  {purse.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFiltered ? (
        <Button variant="ghost" size="sm" onClick={() => onChange(emptyTransactionFilters)}>
          Clear filters
        </Button>
      ) : null}
    </section>
  );
}
