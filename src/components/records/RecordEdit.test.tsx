import { resetFinanceStore } from "@/test/resetFinanceStore";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecordEditDialog } from "./RecordEditDialog";
import { financeStore } from "@/lib/finance/store";

describe("RecordEditDialog", () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    resetFinanceStore();
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

  it("keeps edits available for retry when device storage rejects a save", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const txn = state.transactions[0];
    const onClose = vi.fn();
    render(<RecordEditDialog state={state} transaction={txn} onClose={onClose} />);
    const amount = screen.getByLabelText("Amount (Ft)");
    await user.clear(amount);
    await user.type(amount, "123,45");
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("full", "QuotaExceededError"); });
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(financeStore.getState()).toBe(state);
    expect(onClose).not.toHaveBeenCalled();
    expect(amount).toHaveValue("123,45");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    write.mockRestore();
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(financeStore.getState().transactions.find((record) => record.id === txn.id)?.amount).toBe(123.45);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps a record and its dialog open when a confirmed delete cannot be saved", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const onClose = vi.fn();
    render(<RecordEditDialog state={state} transaction={state.transactions[0]} onClose={onClose} />);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("full", "QuotaExceededError"); });
    await user.click(screen.getByRole("button", { name: "Delete record" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));
    expect(financeStore.getState()).toBe(state);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
