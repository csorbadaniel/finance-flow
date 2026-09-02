import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PurseList } from "./PurseList";
import { PurseEditDialog } from "./PurseEditDialog";
import { financeStore } from "@/lib/finance/store";

function renderList() {
  const state = financeStore.getState();
  return render(<PurseList state={state} onEdit={() => {}} />);
}

describe("Purse manager", () => {
  beforeEach(() => {
    financeStore.resetToMock();
  });

  it("lists every purse and marks the default one", () => {
    renderList();
    const state = financeStore.getState();
    for (const purse of state.purses) {
      expect(screen.getByText(purse.name)).toBeInTheDocument();
    }
    expect(screen.getAllByText("Default")).toHaveLength(1);
  });

  it("sets a new default purse when the star is pressed", async () => {
    const user = userEvent.setup();
    renderList();
    const nonDefault = financeStore.getState().purses.find((p) => !p.isDefault)!;
    await user.click(screen.getByLabelText(`Set ${nonDefault.name} as default purse`));
    expect(financeStore.getState().purses.find((p) => p.isDefault)?.id).toBe(nonDefault.id);
  });

  it("rejects a duplicate purse name", async () => {
    const user = userEvent.setup();
    const existing = financeStore.getState().purses[0];
    render(
      <PurseEditDialog state={financeStore.getState()} mode={{ kind: "create" }} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Purse name"), existing.name);
    await user.click(screen.getByRole("button", { name: "Add purse" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/i);
  });

  it("adds a purse", async () => {
    const user = userEvent.setup();
    render(
      <PurseEditDialog state={financeStore.getState()} mode={{ kind: "create" }} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Purse name"), "Travel card");
    await user.click(screen.getByRole("button", { name: "Add purse" }));
    expect(financeStore.getState().purses.some((p) => p.name === "Travel card")).toBe(true);
  });

  it("renames a purse", async () => {
    const user = userEvent.setup();
    const purse = financeStore.getState().purses[0];
    render(
      <PurseEditDialog state={financeStore.getState()} mode={{ kind: "edit", purse }} onClose={() => {}} />,
    );
    const input = screen.getByLabelText("Purse name");
    await user.clear(input);
    await user.type(input, "Renamed purse");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(financeStore.getState().purses.find((p) => p.id === purse.id)?.name).toBe(
      "Renamed purse",
    );
  });

  it("deletes a purse and moves its records to the default purse", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const purse = state.purses.find((p) => !p.isDefault)!;
    render(
      <PurseEditDialog state={state} mode={{ kind: "edit", purse }} onClose={() => {}} />,
    );
    await user.click(screen.getByRole("button", { name: "Delete purse" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));
    const next = financeStore.getState();
    expect(next.purses.some((p) => p.id === purse.id)).toBe(false);
    expect(next.transactions.some((t) => t.purseId === purse.id)).toBe(false);
  });

  it("shows the record count for the edited purse", () => {
    const state = financeStore.getState();
    const purse = state.purses[0];
    const count = state.transactions.filter((t) => t.purseId === purse.id).length;
    const { container } = render(
      <PurseEditDialog state={state} mode={{ kind: "edit", purse }} onClose={() => {}} />,
    );
    expect(within(document.body).getByText(new RegExp(`${count} record`))).toBeInTheDocument();
    expect(container).toBeTruthy();
  });
});
