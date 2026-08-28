import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CategoryEditDialog } from "./CategoryEditDialog";
import { CategoryTree } from "./CategoryTree";
import { financeStore } from "@/lib/finance/store";

describe("CategoryTree", () => {
  beforeEach(() => {
    financeStore.resetToMock();
  });

  it("renders top-level categories", () => {
    const state = financeStore.getState();
    const roots = state.categories.filter((c) => c.parentId === null);

    render(<CategoryTree state={state} onAddChild={() => {}} onEdit={() => {}} />);

    for (const root of roots) {
      expect(screen.getByText(root.name)).toBeInTheDocument();
    }
  });

  it("calls onEdit when the edit button of a category is pressed", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const root = state.categories.find((c) => c.parentId === null)!;
    let editedId: string | null = null;

    render(
      <CategoryTree state={state} onAddChild={() => {}} onEdit={(c) => (editedId = c.id)} />,
    );
    await user.click(screen.getByRole("button", { name: `Edit ${root.name}` }));

    expect(editedId).toBe(root.id);
  });

  it("does not offer adding a subcategory on level 3", () => {
    const state = financeStore.getState();
    const leaf = state.categories.find((c) => c.level === 3);

    render(<CategoryTree state={state} onAddChild={() => {}} onEdit={() => {}} />);

    if (leaf) {
      expect(
        screen.queryByRole("button", { name: `Add subcategory to ${leaf.name}` }),
      ).not.toBeInTheDocument();
    }
  });
});

describe("CategoryEditDialog", () => {
  beforeEach(() => {
    financeStore.resetToMock();
  });

  it("adds a new top-level category", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();

    render(
      <CategoryEditDialog state={state} mode={{ kind: "create", parent: null }} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Name"), "Hobbies");
    await user.click(screen.getByRole("button", { name: "Add category" }));

    const created = financeStore.getState().categories.find((c) => c.name === "Hobbies");
    expect(created?.parentId).toBeNull();
    expect(created?.level).toBe(1);
  });

  it("renames an existing category", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const target = state.categories.find((c) => c.parentId === null)!;

    render(
      <CategoryEditDialog state={state} mode={{ kind: "edit", category: target }} onClose={() => {}} />,
    );
    const input = screen.getByLabelText("Name");
    await user.clear(input);
    await user.type(input, "Renamed");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(financeStore.getState().categories.find((c) => c.id === target.id)?.name).toBe("Renamed");
  });

  it("shows an error for a duplicate name in the same parent", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const existing = state.categories.find((c) => c.parentId === null)!;

    render(
      <CategoryEditDialog state={state} mode={{ kind: "create", parent: null }} onClose={() => {}} />,
    );
    await user.type(screen.getByLabelText("Name"), existing.name);
    await user.click(screen.getByRole("button", { name: "Add category" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/already exists/i);
  });

  it("deletes a category and its subtree after confirmation", async () => {
    const user = userEvent.setup();
    const state = financeStore.getState();
    const target = state.categories.find((c) => c.parentId === null)!;
    const subtreeSize = financeStore.getCategoryDescendants(target.id).length;

    render(
      <CategoryEditDialog state={state} mode={{ kind: "edit", category: target }} onClose={() => {}} />,
    );
    await user.click(screen.getByRole("button", { name: "Delete category" }));
    await user.click(screen.getByRole("button", { name: "Confirm delete" }));

    const remaining = financeStore.getState().categories;
    expect(remaining.find((c) => c.id === target.id)).toBeUndefined();
    expect(subtreeSize).toBeGreaterThan(0);
  });
});
