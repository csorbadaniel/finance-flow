import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChartExplorer } from "./ChartExplorer";
import { initialFinanceState } from "@/lib/finance/initialState";
vi.mock("./ChartResult", () => ({
  ChartResult: ({
    config,
  }: {
    config: { view: string; start: string; end: string; categoryId: string | null };
  }) => (
    <div data-testid="chart-result">
      {config.view} {config.start} {config.end} {config.categoryId}
    </div>
  ),
}));

describe("Chart selection flow", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });
  it("waits for a view and an explicitly picked period before drawing", async () => {
    const user = userEvent.setup();
    render(<ChartExplorer state={initialFinanceState} />);
    expect(screen.queryByTestId("chart-result")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Expenses" }));
    expect(screen.queryByTestId("chart-result")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Last 3 months" }));
    expect(screen.getByTestId("chart-result")).toHaveTextContent("expense");
    await user.click(screen.getByRole("button", { name: "Income" }));
    expect(screen.getByTestId("chart-result")).toHaveTextContent("income");
  });
  it("requires the view first and keeps both chart formats available for balance", async () => {
    const user = userEvent.setup();
    render(<ChartExplorer state={initialFinanceState} />);
    expect(screen.getByRole("button", { name: "Last month" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Balance" }));
    await user.click(screen.getByRole("button", { name: "Last month" }));
    await user.click(screen.getByRole("button", { name: "Pie chart" }));
    expect(screen.getByTestId("chart-result")).toHaveTextContent("balance");
  });
});
