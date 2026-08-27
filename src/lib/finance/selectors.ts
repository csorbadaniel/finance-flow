import type { Category, FinanceState, Transaction, TransactionType } from "./types";

export function formatHUF(amount: number): string {
  return `${new Intl.NumberFormat("hu-HU").format(Math.round(amount))} Ft`;
}

export function getCategoryById(state: FinanceState, id: string): Category | undefined {
  return state.categories.find((c) => c.id === id);
}

/** Returns ancestor chain root → leaf for a given category id. */
export function getCategoryPath(state: FinanceState, id: string): Category[] {
  const out: Category[] = [];
  let current = getCategoryById(state, id);
  while (current) {
    out.unshift(current);
    current = current.parentId ? getCategoryById(state, current.parentId) : undefined;
  }
  return out;
}

/** All descendant IDs of a category (inclusive). */
export function getCategorySubtreeIds(state: FinanceState, rootId: string): Set<string> {
  const out = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of state.categories) {
      if (c.parentId && out.has(c.parentId) && !out.has(c.id)) {
        out.add(c.id);
        changed = true;
      }
    }
  }
  return out;
}

export function isInCurrentMonth(isoDate: string, now: Date = new Date()): boolean {
  const d = new Date(isoDate);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
}

export function getMonthSummary(transactions: Transaction[], now: Date = new Date()): MonthSummary {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (!isInCurrentMonth(t.date, now)) continue;
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

export function getDefaultPurseId(state: FinanceState): string | undefined {
  return (state.purses.find((p) => p.isDefault) ?? state.purses[0])?.id;
}

/** Formats an ISO date (YYYY-MM-DD) for display as YYYY/MM/DD. */
export function formatDisplayDate(isoDate: string): string {
  const d = new Date(isoDate);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}/${month}/${day}`;
}

/** Returns the YYYY-MM month key of an ISO date. */
export function getMonthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Formats a YYYY-MM key as a readable month label, e.g. "2026/08". */
export function formatMonthKey(monthKey: string): string {
  return monthKey.replace("-", "/");
}

export interface TransactionFilters {
  search: string;
  type: TransactionType | "all";
  categoryId: string | "all";
  purseId: string | "all";
  month: string | "all";
}

export const emptyTransactionFilters: TransactionFilters = {
  search: "",
  type: "all",
  categoryId: "all",
  purseId: "all",
  month: "all",
};

/** Applies the record filters and returns the matching transactions, newest first. */
export function filterTransactions(
  state: FinanceState,
  filters: TransactionFilters,
): Transaction[] {
  const search = filters.search.trim().toLowerCase();
  const categoryIds =
    filters.categoryId === "all" ? null : getCategorySubtreeIds(state, filters.categoryId);

  return state.transactions
    .filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (categoryIds && !categoryIds.has(t.categoryId)) return false;
      if (filters.purseId !== "all" && t.purseId !== filters.purseId) return false;
      if (filters.month !== "all" && getMonthKey(t.date) !== filters.month) return false;
      if (search) {
        const categoryName = getCategoryPath(state, t.categoryId)
          .map((c) => c.name)
          .join(" ")
          .toLowerCase();
        const haystack = `${t.note ?? ""} ${categoryName} ${t.recordNumber} ${t.amount}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Distinct month keys present in the data, newest first. */
export function getAvailableMonths(state: FinanceState): string[] {
  return [...new Set(state.transactions.map((t) => getMonthKey(t.date)))].sort().reverse();
}

/** Groups transactions by month key, preserving the incoming order. */
export function groupByMonth(transactions: Transaction[]): { monthKey: string; items: Transaction[] }[] {
  const groups: { monthKey: string; items: Transaction[] }[] = [];
  for (const t of transactions) {
    const monthKey = getMonthKey(t.date);
    const last = groups[groups.length - 1];
    if (last && last.monthKey === monthKey) last.items.push(t);
    else groups.push({ monthKey, items: [t] });
  }
  return groups;
}

export function sumByType(transactions: Transaction[]): MonthSummary {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}
