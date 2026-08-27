import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { MonthSummaryCard } from "./MonthSummaryCard";
import { RecentTransactions } from "./RecentTransactions";
import { financeStore } from "@/lib/finance/store";
import { formatHUF, getMonthSummary } from "@/lib/finance/selectors";

// Link needs a router context that these unit tests don't provide.
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: React.ReactNode }) => <a href="/records">{children}</a>,
}));

/** Normalizes non-breaking spaces used by the hu-HU number format. */
function normalize(value: string): string {
  return value.replace(/\s/g, " ");
}

describe("Home widgets", () => {
  beforeEach(() => {
    financeStore.resetToMock();
  });

  it("shows the monthly balance, income and expense", () => {
    const state = financeStore.getState();
    const summary = getMonthSummary(state.transactions);

    render(<MonthSummaryCard transactions={state.transactions} />);

    expect(normalize(screen.getByLabelText("Balance this month").textContent ?? "")).toBe(
      normalize(formatHUF(summary.balance)),
    );
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expense")).toBeInTheDocument();
  });

  it("renders an empty state when there are no records", () => {
    const state = { ...financeStore.getState(), transactions: [] };
    render(<RecentTransactions state={state} />);
    expect(screen.getByText(/no records yet/i)).toBeInTheDocument();
  });
});
