import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { RecordsList } from "./RecordsList";
import { financeStore } from "@/lib/finance/store";
import {
  emptyTransactionFilters,
  filterTransactions,
  getAvailableMonths,
  groupByMonth,
} from "@/lib/finance/selectors";

describe("Records", () => {
  beforeEach(() => {
    financeStore.resetToMock();
  });

  it("filters by type", () => {
    const state = financeStore.getState();
    const incomes = filterTransactions(state, { ...emptyTransactionFilters, type: "income" });

    expect(incomes.length).toBeGreaterThan(0);
    expect(incomes.every((t) => t.type === "income")).toBe(true);
  });

  it("filters by month", () => {
    const state = financeStore.getState();
    const month = getAvailableMonths(state)[0];
    const result = filterTransactions(state, { ...emptyTransactionFilters, month });

    expect(result.length).toBeGreaterThan(0);
    expect(result.every((t) => t.date.startsWith(month))).toBe(true);
  });

  it("returns results sorted newest first and grouped by month", () => {
    const state = financeStore.getState();
    const all = filterTransactions(state, emptyTransactionFilters);

    for (let i = 1; i < all.length; i += 1) {
      expect(all[i - 1].date >= all[i].date).toBe(true);
    }
    const groups = groupByMonth(all);
    expect(new Set(groups.map((g) => g.monthKey)).size).toBe(groups.length);
  });

  it("renders an empty state when nothing matches", () => {
    const state = financeStore.getState();
    render(<RecordsList state={state} transactions={[]} />);

    expect(screen.getByText("No records match your filters.")).toBeInTheDocument();
  });

  it("renders the record number of each visible transaction", () => {
    const state = financeStore.getState();
    const transactions = filterTransactions(state, emptyTransactionFilters).slice(0, 3);

    render(<RecordsList state={state} transactions={transactions} />);

    for (const txn of transactions) {
      expect(screen.getByText(new RegExp(`#${txn.recordNumber}`))).toBeInTheDocument();
    }
  });
});
