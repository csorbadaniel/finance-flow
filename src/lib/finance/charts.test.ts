import { describe, expect, it } from "vitest";
import {
  chartSlices,
  aggregateByDay,
  aggregateCategoryLevel,
  filterChartTransactions,
  previousMonths,
  recentSliderBounds,
  sortChronologically,
} from "./charts";
import { initialFinanceState } from "./initialState";
import type { Transaction } from "./types";
const now = new Date(2026, 10, 19);
const transaction = (patch: Partial<Transaction> = {}): Transaction => ({
  id: "t",
  recordNumber: "00001",
  type: "expense",
  amount: 10,
  categoryId: "cat-food-rest-fast",
  purseId: "purse-cash",
  date: "2026-11-18",
  createdAt: "2026-11-18",
  ...patch,
});
describe("Chart period rules", () => {
  it.each([
    [1, "2026-10-01"],
    [3, "2026-08-01"],
    [6, "2026-05-01"],
  ] as const)("quick fills %i previous complete months", (months, start) => {
    expect(previousMonths(months, now)).toEqual({ start, end: "2026-10-31" });
  });
  it("offers exactly the most recent two months on the slider", () => {
    expect(recentSliderBounds(now)).toEqual({ start: "2026-09-19", end: "2026-11-19" });
  });
  it("includes both endpoints and excludes other dates, types, and categories", () => {
    const state = {
      ...initialFinanceState,
      transactions: [
        transaction({ id: "start", date: "2026-11-01" }),
        transaction({ id: "end" }),
        transaction({ id: "before", date: "2026-10-31" }),
        transaction({ id: "income", type: "income" }),
        transaction({ id: "other", categoryId: "cat-transport-fuel" }),
      ],
    };
    expect(
      filterChartTransactions(state, {
        view: "expense",
        start: "2026-11-01",
        end: "2026-11-18",
        format: "bar",
        categoryId: "cat-food",
      }).map((t) => t.id),
    ).toEqual(["start", "end"]);
  });
});
describe("Chart aggregation rules", () => {
  it("uses daily time points including zero days and signed daily balance", () => {
    expect(
      aggregateByDay(
        [transaction({ amount: 30 }), transaction({ type: "income", amount: 100 })],
        "2026-11-17",
        "2026-11-19",
      ),
    ).toEqual([
      { date: "2026-11-17", income: 0, expense: 0, balance: 0, cumulative: 0 },
      { date: "2026-11-18", income: 100, expense: 30, balance: 70, cumulative: 70 },
      { date: "2026-11-19", income: 0, expense: 0, balance: 0, cumulative: 70 },
    ]);
  });
  it("keeps a running sum of daily balances across the period", () => {
    const points = aggregateByDay(
      [
        transaction({ date: "2026-11-17", type: "income", amount: 100 }),
        transaction({ date: "2026-11-18", amount: 40 }),
        transaction({ date: "2026-11-19", amount: 80 }),
      ],
      "2026-11-17",
      "2026-11-19",
    );
    expect(points.map((point) => point.cumulative)).toEqual([100, 60, -20]);
  });
  it("lists filtered records oldest first, tie-broken by creation time", () => {
    const sorted = sortChronologically([
      transaction({ id: "c", date: "2026-11-19" }),
      transaction({ id: "b", date: "2026-11-17", createdAt: "2026-11-17T10:00:00Z" }),
      transaction({ id: "a", date: "2026-11-17", createdAt: "2026-11-17T08:00:00Z" }),
    ]);
    expect(sorted.map((t) => t.id)).toEqual(["a", "b", "c"]);
  });
  it("drills from root to subcategory to leaf and retains direct parent records", () => {
    const transactions = [
      transaction({ amount: 30 }),
      transaction({ categoryId: "cat-food", amount: 20 }),
    ];
    expect(
      aggregateCategoryLevel(initialFinanceState, transactions, null).map((s) => [
        s.categoryId,
        s.value,
      ]),
    ).toEqual([["cat-food", 50]]);
    expect(
      aggregateCategoryLevel(initialFinanceState, transactions, "cat-food").map((s) => [
        s.categoryId,
        s.value,
      ]),
    ).toEqual([
      ["cat-food-restaurant", 30],
      ["cat-food", 20],
    ]);
    expect(
      aggregateCategoryLevel(initialFinanceState, [transactions[0]], "cat-food-restaurant")[0]
        .categoryId,
    ).toBe("cat-food-rest-fast");
    expect(
      aggregateCategoryLevel(initialFinanceState, [transactions[0]], "cat-food-rest-fast")[0].value,
    ).toBe(30);
  });
});

describe("Balance pie", () => {
  it("uses expense category slices, not income, while retaining net balance transactions", () => {
    const transactions = [
      transaction({ amount: 30 }),
      transaction({ type: "income", categoryId: "cat-salary-main", amount: 100 }),
    ];
    expect(
      chartSlices(initialFinanceState, transactions, "balance", null).map((slice) => [
        slice.categoryId,
        slice.value,
      ]),
    ).toEqual([["cat-food", 30]]);
  });
});
