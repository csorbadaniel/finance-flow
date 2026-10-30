import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.resetModules());

describe("starting data", () => {
  it("starts a new device with no sample records and a usable category and default purse", async () => {
    vi.resetModules();
    const { financeStore } = await import("./store");
    const state = financeStore.getState();
    expect(state.transactions).toEqual([]);
    expect(state.categories.length).toBeGreaterThan(0);
    expect(state.purses.filter((purse) => purse.isDefault)).toHaveLength(1);
  });

  it("leaves existing saved records and preferences untouched", async () => {
    const saved = {
      transactions: [{ id: "personal", recordNumber: "00001", type: "expense", amount: 42, categoryId: "custom", purseId: "wallet", date: "2026-10-30", createdAt: "2026-10-30T10:00:00Z" }],
      categories: [{ id: "custom", name: "Personal", parentId: null, level: 1 }],
      purses: [{ id: "wallet", name: "My wallet", isDefault: true }],
      onboardingSeen: true,
      currency: "EUR",
    };
    localStorage.setItem("financeflow.state.v1", JSON.stringify(saved));
    vi.resetModules();
    const { financeStore } = await import("./store");
    expect(financeStore.getState()).toEqual(saved);
    expect(JSON.parse(localStorage.getItem("financeflow.state.v1") ?? "null")).toEqual(saved);
  });
});