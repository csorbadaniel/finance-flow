import type { Category, FinanceState, Transaction } from "./types";

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
