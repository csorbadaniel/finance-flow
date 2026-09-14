import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CurrencyPreference } from "./CurrencyPreference";
import { AppearancePreference } from "./AppearancePreference";
import { OnboardingRestart } from "./OnboardingRestart";
import { MonthSummaryCard } from "@/components/home/MonthSummaryCard";
import { financeStore } from "@/lib/finance/store";
import { formatMoney } from "@/lib/finance/currency";
import { appearanceStore } from "@/lib/appearance";

const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

describe("currency preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    financeStore.resetToMock();
    navigate.mockClear();
  });

  it("formats amounts per currency", () => {
    expect(formatMoney(1234, "HUF")).toMatch(/1.?234 Ft/);
    expect(formatMoney(1234.5, "USD")).toBe("$1,234.50");
  });

  it("defaults to HUF and persists a new selection", async () => {
    const user = userEvent.setup();
    render(<CurrencyPreference />);
    expect(financeStore.getState().currency).toBe("HUF");

    await user.click(screen.getByRole("combobox", { name: /currency/i }));
    await user.click(screen.getByRole("option", { name: /USD/ }));

    expect(financeStore.getState().currency).toBe("USD");
  });

  it("drives the balance display", () => {
    financeStore.setCurrency("EUR");
    const { container } = render(<MonthSummaryCard transactions={[]} />);
    expect(container.textContent).toContain("€");
  });
});

describe("appearance preference", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    appearanceStore.reset();
  });

  it("defaults to dark and persists a light selection", async () => {
    const user = userEvent.setup();
    render(<AppearancePreference />);

    expect(document.documentElement).toHaveClass("dark");
    await user.click(screen.getByRole("button", { name: "Light" }));

    expect(document.documentElement).not.toHaveClass("dark");
    expect(window.localStorage.getItem("financeflow-appearance")).toBe("light");
  });
});

describe("onboarding restart", () => {
  beforeEach(() => {
    window.localStorage.clear();
    financeStore.resetToMock();
    navigate.mockClear();
  });

  it("clears the onboarding flag and returns home", async () => {
    const user = userEvent.setup();
    financeStore.setOnboardingSeen(true);
    render(<OnboardingRestart />);

    await user.click(screen.getByRole("button", { name: /restart tutorial/i }));

    expect(financeStore.getState().onboardingSeen).toBe(false);
    expect(navigate).toHaveBeenCalledWith({ to: "/" });
  });
});
