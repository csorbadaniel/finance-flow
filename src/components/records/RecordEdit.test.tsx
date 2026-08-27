import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecordEditDialog } from "./RecordEditDialog";
import { financeStore } from "@/lib/finance/store";

describe("RecordEditDialog", () => {
  beforeEach(() => {
    financeStore.resetToMock();
  });

  it("prefills the form with the selected record", () => {
    const state = financeStore.getState();
    const txn = state.transactions[0];

    render(<RecordEditDialog state={state} transaction={txn} onClose={() => {}} />);

    expect(screen.getByLabelText("Amount (Ft)")).toHaveValue(String(txn.amount));
    expect(screen.getByLabelText("Date")).toHaveValue(txn.date);
    expect(screen.getByText(`Record #${txn.recordNumber}`)).toBeInTheDocument();
  });

  it("saves an edited amount to the store", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const txn = state.transactions[0];

    render(<RecordEditDialog state={state} transaction={txn} onClose={() => {}} />);

    const amountInput = screen.getByLabelText("Amount (Ft)");
    await user.clear(amountInput);
    await user.type(amountInput, "12345");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(financeStore.getState().transactions.find((t) => t.id === txn.id)?.amount).toBe(12345);
  });

  it("rejects a non-positive amount", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const txn = state.transactions[0];

    render(<RecordEditDialog state={state} transaction={txn} onClose={() => {}} />);

    const amountInput = screen.getByLabelText("Amount (Ft)");
    await user.clear(amountInput);
    await user.type(amountInput, "0");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter an amount greater than zero.");
    expect(financeStore.getState().transactions.find((t) => t.id === txn.id)?.amount).toBe(
      txn.amount,
    );
  });

  it("deletes the record after confirmation", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const txn = state.transactions[0];

    render(<RecordEditDialog state={state} transaction={txn} onClose={() => {}} />);

    await user.click(screen.getByRole("button", { name: "Delete record" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    expect(financeStore.getState().transactions.some((t) => t.id === txn.id)).toBe(false);
  });
});
