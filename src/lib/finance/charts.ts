import type { FinanceState, Transaction } from "./types";
import { getCategoryPath, getMonthKey } from "./selectors";

export type ChartView = "expense" | "income" | "balance";
export type ChartRange = "thisMonth" | "lastMonth" | "last3Months" | "thisYear" | "all";
export type ChartFormat = "pie" | "bar" | "line";

export interface ChartConfig {
  view: ChartView;
  range: ChartRange;
  format: ChartFormat;
}

export const defaultChartConfig: ChartConfig = {
  view: "expense",
  range: "thisMonth",
  format: "pie",
};

export const chartViewLabels: Record<ChartView, string> = {
  expense: "Expenses by category",
  income: "Income by category",
  balance: "Balance over time",
};

export const chartRangeLabels: Record<ChartRange, string> = {
  thisMonth: "This month",
  lastMonth: "Last month",
  last3Months: "Last 3 months",
  thisYear: "This year",
  all: "All time",
};

export const chartFormatLabels: Record<ChartFormat, string> = {
  pie: "Pie chart",
  bar: "Bar chart",
  line: "Line chart",
};

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export interface DateRangeBounds {
  /** Inclusive ISO start date, or null for an open start. */
  start: string | null;
  /** Inclusive ISO end date. */
  end: string;
}

export function getRangeBounds(range: ChartRange, now: Date = new Date()): DateRangeBounds {
  const end = toIsoDate(now);
  switch (range) {
    case "thisMonth":
      return { start: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)), end };
    case "lastMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: toIsoDate(start), end: toIsoDate(lastDay) };
    }
    case "last3Months":
      return { start: toIsoDate(new Date(now.getFullYear(), now.getMonth() - 2, 1)), end };
    case "thisYear":
      return { start: toIsoDate(new Date(now.getFullYear(), 0, 1)), end };
    case "all":
    default:
      return { start: null, end };
  }
}

export function filterByRange(
  transactions: Transaction[],
  range: ChartRange,
  now: Date = new Date(),
): Transaction[] {
  const { start, end } = getRangeBounds(range, now);
  return transactions.filter((t) => (start === null || t.date >= start) && t.date <= end);
}

export interface CategorySlice {
  categoryId: string;
  label: string;
  value: number;
  share: number;
}

/** Aggregates transactions of one type into their top-level category, largest first. */
export function aggregateByTopCategory(
  state: FinanceState,
  transactions: Transaction[],
  view: Exclude<ChartView, "balance">,
): CategorySlice[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== view) continue;
    const root = getCategoryPath(state, t.categoryId)[0];
    if (!root) continue;
    totals.set(root.id, (totals.get(root.id) ?? 0) + t.amount);
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  return [...totals.entries()]
    .map(([categoryId, value]) => ({
      categoryId,
      label: state.categories.find((c) => c.id === categoryId)?.name ?? "Unknown",
      value,
      share: sum > 0 ? value / sum : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

export interface MonthPoint {
  monthKey: string;
  income: number;
  expense: number;
  balance: number;
}

/** Aggregates transactions per month, oldest first. */
export function aggregateByMonth(transactions: Transaction[]): MonthPoint[] {
  const byMonth = new Map<string, MonthPoint>();
  for (const t of transactions) {
    const monthKey = getMonthKey(t.date);
    const point = byMonth.get(monthKey) ?? { monthKey, income: 0, expense: 0, balance: 0 };
    if (t.type === "income") point.income += t.amount;
    else point.expense += t.amount;
    point.balance = point.income - point.expense;
    byMonth.set(monthKey, point);
  }
  return [...byMonth.values()].sort((a, b) => (a.monthKey < b.monthKey ? -1 : 1));
}
