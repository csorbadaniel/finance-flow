import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { financeStore } from "@/lib/finance/store";
import { DemoData } from "./DemoData";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => {
  financeStore.replaceData({ transactions: [], categories: [], purses: [{ id: "personal-wallet", name: "My wallet", isDefault: true }], currency: "EUR" });
  financeStore.setOnboardingSeen(true);
});

describe("optional demo", () => {
  it("does not load records until explicitly confirmed, and cancel keeps the device untouched", async () => {
    const user = userEvent.setup();
    render(<DemoData />);
    const before = financeStore.getState();
    await user.click(screen.getByRole("button", { name: "Load demo data" }));
    expect(financeStore.getState()).toBe(before);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(financeStore.getState()).toBe(before);
  });

  it("loads sample records only after confirmation and preserves custom purses and preferences", async () => {
    const user = userEvent.setup();
    render(<DemoData />);
    await user.click(screen.getByRole("button", { name: "Load demo data" }));
    await user.click(screen.getByRole("button", { name: "Add sample records" }));
    await screen.findByRole("button", { name: "Load demo data" });
    expect(financeStore.getState().transactions).toHaveLength(36);
    expect(financeStore.getState().purses.find((purse) => purse.id === "personal-wallet")?.isDefault).toBe(true);
    expect(financeStore.getState().purses.filter((purse) => purse.isDefault)).toHaveLength(1);
    expect(financeStore.getState().currency).toBe("EUR");
    expect(financeStore.getState().onboardingSeen).toBe(true);
    expect(JSON.parse(localStorage.getItem("financeflow.state.v1") ?? "null").transactions).toHaveLength(36);
  });

  it("does not offer to load demo data when records already exist", () => {
    financeStore.addTransaction({ type: "expense", amount: 42, categoryId: "personal", purseId: "personal-wallet", date: "2026-10-30" });
    const before = financeStore.getState();
    render(<DemoData />);
    expect(screen.getByRole("button", { name: "Load demo data" })).toBeDisabled();
    expect(financeStore.getState()).toBe(before);
  });
});