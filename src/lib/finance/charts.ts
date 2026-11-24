import { addDays, subMonths } from "date-fns";
import { toIsoDate } from "@/lib/dates";
import { getCategoryPath, getCategorySubtreeIds } from "./selectors";
import type { FinanceState, Transaction } from "./types";

export type ChartView = "expense" | "balance" | "income";
export type ChartFormat = "bar" | "pie";
export interface ChartPeriod {
  start: string;
  end: string;
}
export interface ChartConfig extends ChartPeriod {
  view: ChartView;
  format: ChartFormat;
  categoryId: string | null;
}
export const chartViewLabels: Record<ChartView, string> = {
  expense: "Expenses",
  balance: "Balance",
  income: "Income",
};
export function parseChartDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
export function previousMonths(months: 1 | 3 | 6, now = new Date()): ChartPeriod {
  return {
    start: toIsoDate(new Date(now.getFullYear(), now.getMonth() - months, 1)),
    end: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 0)),
  };
}
export function recentSliderBounds(now = new Date()): ChartPeriod {
  return { start: toIsoDate(subMonths(now, 2)), end: toIsoDate(now) };
}
export function filterChartTransactions(state: FinanceState, config: ChartConfig): Transaction[] {
  const categoryIds = config.categoryId ? getCategorySubtreeIds(state, config.categoryId) : null;
  return state.transactions.filter(
    (t) =>
      t.date >= config.start &&
      t.date <= config.end &&
      (config.view === "balance" || t.type === config.view) &&
      (!categoryIds || categoryIds.has(t.categoryId)),
  );
}
export interface CategorySlice {
  categoryId: string;
  label: string;
  value: number;
  share: number;
}
/** Shows the next level; records assigned directly to a parent remain visible. */
export function aggregateCategoryLevel(
  state: FinanceState,
  transactions: Transaction[],
  parentId: string | null,
): CategorySlice[] {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    const path = getCategoryPath(state, transaction.categoryId);
    const parentIndex = parentId ? path.findIndex((category) => category.id === parentId) : -1;
    if (parentId && parentIndex < 0) continue;
    const category = path[parentIndex + 1] ?? path[parentIndex];
    if (!category) continue;
    totals.set(category.id, (totals.get(category.id) ?? 0) + transaction.amount);
  }
  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
  return [...totals]
    .map(([categoryId, value]) => ({
      categoryId,
      value,
      share: total ? value / total : 0,
      label: `${state.categories.find((category) => category.id === categoryId)?.name ?? "Unknown"}${categoryId === parentId && state.categories.some((category) => category.parentId === parentId) ? " (direct)" : ""}`,
    }))
    .sort((a, b) => b.value - a.value);
}
export interface DayPoint {
  date: string;
  income: number;
  expense: number;
  balance: number;
  /** Running sum of daily balances from the period start. */
  cumulative: number;
}
/** Daily net balance plus its running sum over the period. Missing days have zero amounts. */
export function aggregateByDay(
  transactions: Transaction[],
  start: string,
  end: string,
): DayPoint[] {
  const points = new Map<string, DayPoint>();
  for (let day = parseChartDate(start); toIsoDate(day) <= end; day = addDays(day, 1)) {
    const date = toIsoDate(day);
    points.set(date, { date, income: 0, expense: 0, balance: 0, cumulative: 0 });
  }
  for (const transaction of transactions) {
    const point = points.get(transaction.date);
    if (!point) continue;
    point[transaction.type] += transaction.amount;
    point.balance = point.income - point.expense;
  }
  let runningTotal = 0;
  for (const point of points.values()) {
    runningTotal += point.balance;
    point.cumulative = runningTotal;
  }
  return [...points.values()];
}

/** Oldest first; same-day records keep the order they were created in. */
export function sortChronologically(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  );
}

export function chartSlices(
  state: FinanceState,
  transactions: Transaction[],
  view: ChartView,
  parentId: string | null,
): CategorySlice[] {
  const type = view === "income" ? "income" : "expense";
  return aggregateCategoryLevel(
    state,
    transactions.filter((transaction) => transaction.type === type),
    parentId,
  );
}
