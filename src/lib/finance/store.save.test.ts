import { afterEach, describe, expect, it, vi } from "vitest";
import { financeStore, DeviceSaveError } from "./store";
import { resetFinanceStore } from "@/test/resetFinanceStore";

describe("device save failures", () => {
  afterEach(() => { vi.restoreAllMocks(); resetFinanceStore(); });

  it("throws a clear error and keeps the previous data when saving a record fails", () => {
    resetFinanceStore();
    const before = financeStore.getState();
    const { categories, purses } = before;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("full", "QuotaExceededError"); });
    expect(() => financeStore.addTransaction({ type: "expense", amount: 10, categoryId: categories[0].id, purseId: purses[0].id, date: "2026-10-29" }))
      .toThrow(DeviceSaveError);
    expect(financeStore.getState()).toBe(before);
  });

  it("saves normally again once storage works", () => {
    resetFinanceStore();
    const { categories, purses, transactions } = financeStore.getState();
    financeStore.addTransaction({ type: "expense", amount: 10, categoryId: categories[0].id, purseId: purses[0].id, date: "2026-10-29" });
    expect(financeStore.getState().transactions).toHaveLength(transactions.length + 1);
  });
});
