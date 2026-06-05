import { describe, it, expect, beforeEach } from "vitest";
import { financeStore } from "./store";
import { getMonthSummary, getCategoryPath, getCategorySubtreeIds, formatHUF } from "./selectors";

beforeEach(() => {
  financeStore.resetToMock();
});

describe("financeStore — transactions", () => {
  it("adds a transaction with a fresh record number and prepends it", () => {
    const before = financeStore.getState().transactions.length;
    const txn = financeStore.addTransaction({
      type: "expense",
      amount: 1500,
      categoryId: "cat-food-rest-fast",
      purseId: "purse-cash",
      date: "2026-06-05",
      note: "  coffee  ",
    });
    const state = financeStore.getState();
    expect(state.transactions.length).toBe(before + 1);
    expect(state.transactions[0].id).toBe(txn.id);
    expect(txn.note).toBe("coffee");
    expect(txn.recordNumber).toMatch(/^\d{5}$/);
  });

  it("rejects non-positive amounts", () => {
    expect(() =>
      financeStore.addTransaction({
        type: "expense",
        amount: 0,
        categoryId: "cat-food-rest-fast",
        purseId: "purse-cash",
        date: "2026-06-05",
      }),
    ).toThrow(/positive/i);
  });

  it("updates and deletes a transaction", () => {
    const txn = financeStore.addTransaction({
      type: "expense",
      amount: 100,
      categoryId: "cat-food-rest-fast",
      purseId: "purse-cash",
      date: "2026-06-05",
    });
    financeStore.updateTransaction(txn.id, { amount: 250, note: "updated" });
    expect(financeStore.getState().transactions.find((t) => t.id === txn.id)?.amount).toBe(250);
    financeStore.deleteTransaction(txn.id);
    expect(financeStore.getState().transactions.find((t) => t.id === txn.id)).toBeUndefined();
  });
});

describe("financeStore — categories", () => {
  it("adds nested categories up to depth 3 and rejects depth 4", () => {
    const l1 = financeStore.addCategory({ name: "Test1", parentId: null });
    const l2 = financeStore.addCategory({ name: "Test2", parentId: l1.id });
    const l3 = financeStore.addCategory({ name: "Test3", parentId: l2.id });
    expect(l3.level).toBe(3);
    expect(() => financeStore.addCategory({ name: "Too Deep", parentId: l3.id })).toThrow(/depth/i);
  });

  it("rejects duplicate names at the same level", () => {
    expect(() => financeStore.addCategory({ name: "Food", parentId: null })).toThrow(/exists/i);
  });

  it("renames and prevents rename collisions", () => {
    const c = financeStore.addCategory({ name: "Misc", parentId: null });
    financeStore.renameCategory(c.id, "Other");
    expect(() => financeStore.renameCategory(c.id, "Food")).toThrow(/exists/i);
  });

  it("deletes a subtree and reassigns transactions to parent", () => {
    // delete "Restaurant" subtree; transactions should move to Food
    financeStore.deleteCategory("cat-food-restaurant");
    const state = financeStore.getState();
    expect(state.categories.find((c) => c.id === "cat-food-restaurant")).toBeUndefined();
    expect(state.categories.find((c) => c.id === "cat-food-rest-fast")).toBeUndefined();
    // any txn previously under fast-food now belongs to Food
    const reassigned = state.transactions.filter((t) => t.categoryId === "cat-food");
    expect(reassigned.length).toBeGreaterThan(0);
  });
});

describe("financeStore — purses", () => {
  it("sets exactly one default purse", () => {
    financeStore.setDefaultPurse("purse-cash");
    const state = financeStore.getState();
    const defaults = state.purses.filter((p) => p.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0].id).toBe("purse-cash");
  });

  it("deleting a purse reassigns its transactions to the default", () => {
    financeStore.deletePurse("purse-cash");
    const state = financeStore.getState();
    expect(state.purses.find((p) => p.id === "purse-cash")).toBeUndefined();
    expect(state.transactions.some((t) => t.purseId === "purse-cash")).toBe(false);
  });
});

describe("selectors", () => {
  it("computes month summary from current-month transactions only", () => {
    financeStore.resetToMock();
    const { income, expense, balance } = getMonthSummary(financeStore.getState().transactions);
    expect(balance).toBe(income - expense);
  });

  it("builds category path root→leaf", () => {
    const state = financeStore.getState();
    const path = getCategoryPath(state, "cat-food-rest-fast");
    expect(path.map((c) => c.id)).toEqual(["cat-food", "cat-food-restaurant", "cat-food-rest-fast"]);
  });

  it("computes subtree ids inclusive", () => {
    const state = financeStore.getState();
    const ids = getCategorySubtreeIds(state, "cat-food");
    expect(ids.has("cat-food")).toBe(true);
    expect(ids.has("cat-food-rest-fast")).toBe(true);
  });

  it("formats HUF with thousands separator", () => {
    expect(formatHUF(180000)).toMatch(/180.?000 Ft/);
  });
});
