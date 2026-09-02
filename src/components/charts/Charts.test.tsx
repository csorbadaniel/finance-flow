import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChartWizard } from "./ChartWizard";
import { financeStore } from "@/lib/finance/store";
import {
  aggregateByMonth,
  aggregateByTopCategory,
  filterByRange,
  getRangeBounds,
} from "@/lib/finance/charts";
import type { Transaction } from "@/lib/finance/types";

const now = new Date(2026, 8, 2); // 2026/09/02

function txn(partial: Partial<Transaction>): Transaction {
  return {
    id: "t",
    recordNumber: "00001",
    type: "expense",
    amount: 1000,
    categoryId: "cat-food-rest-fast",
    purseId: "purse-cash",
    date: "2026-09-01",
    createdAt: "2026-09-01",
    ...partial,
  };
}

describe("Chart data helpers", () => {
  it("bounds this month from the first day", () => {
    expect(getRangeBounds("thisMonth", now)).toEqual({ start: "2026-09-01", end: "2026-09-02" });
  });

  it("bounds last month to its own first and last day", () => {
    expect(getRangeBounds("lastMonth", now)).toEqual({ start: "2026-08-01", end: "2026-08-31" });
  });

  it("keeps only transactions inside the range", () => {
    const items = [
      txn({ id: "in", date: "2026-09-01" }),
      txn({ id: "out", date: "2026-07-15" }),
    ];
    expect(filterByRange(items, "thisMonth", now).map((t) => t.id)).toEqual(["in"]);
  });

  it("rolls amounts up to the top-level category with shares", () => {
    const state = financeStore.getState();
    const slices = aggregateByTopCategory(
      state,
      [
        txn({ id: "a", amount: 3000, categoryId: "cat-food-rest-fast" }),
        txn({ id: "b", amount: 1000, categoryId: "cat-transport-public-bus" }),
        txn({ id: "c", amount: 5000, type: "income", categoryId: "cat-salary-main" }),
      ],
      "expense",
    );
    expect(slices.map((s) => s.label)).toEqual(["Food", "Transport"]);
    expect(slices[0].value).toBe(3000);
    expect(slices[0].share).toBeCloseTo(0.75);
  });

  it("aggregates months oldest first with a balance", () => {
    const points = aggregateByMonth([
      txn({ id: "a", date: "2026-09-01", amount: 400 }),
      txn({ id: "b", date: "2026-08-01", type: "income", amount: 1000 }),
    ]);
    expect(points.map((p) => p.monthKey)).toEqual(["2026-08", "2026-09"]);
    expect(points[1].balance).toBe(-400);
  });
});

describe("Chart wizard", () => {
  beforeEach(() => {
    financeStore.resetToMock();
  });

  it("walks through the three steps and reports the choices", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<ChartWizard onComplete={onComplete} />);

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Income by category" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Last 3 months" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Bar chart" }));
    await user.click(screen.getByRole("button", { name: "Show chart" }));

    expect(onComplete).toHaveBeenCalledWith({
      view: "income",
      range: "last3Months",
      format: "bar",
    });
  });

  it("allows going back to a previous step", async () => {
    const user = userEvent.setup();
    render(<ChartWizard onComplete={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("hides the line format for category views", async () => {
    const user = userEvent.setup();
    render(<ChartWizard onComplete={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByRole("radio", { name: "Line chart" })).not.toBeInTheDocument();
  });
});
