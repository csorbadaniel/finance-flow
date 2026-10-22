import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

const mocks = vi.hoisted(() => ({
  auth: { isAuthenticated: false, isLoading: false },
  list: { data: undefined as unknown, isLoading: false, isError: false, error: null as Error | null, refetch: vi.fn() },
  upload: vi.fn(),
  restore: vi.fn(),
  remove: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/auth/useAuth", () => ({ useAuth: () => mocks.auth }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));
vi.mock("sonner", () => ({ toast: { success: mocks.toastSuccess, error: mocks.toastError } }));
vi.mock("@/lib/cloud/useCloudBackups", () => ({
  useCloudBackups: () => mocks.list,
  useUploadBackup: () => ({ mutateAsync: mocks.upload, isPending: false }),
  useRestoreBackup: () => ({ mutateAsync: mocks.restore, isPending: false }),
  useDeleteBackup: () => ({ mutateAsync: mocks.remove, isPending: false }),
}));

import { CloudBackup } from "./CloudBackup";

const parcel = {
  id: "11111111-1111-4111-8111-111111111111", created_at: "2026-10-21T09:19:00Z", format_version: 1,
  device_label: "Laptop", record_count: 36, category_count: 12, purse_count: 3, currency: "HUF", size_bytes: 12800,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.isAuthenticated = false;
  mocks.list.data = undefined;
  mocks.list.isError = false;
  mocks.list.error = null;
});

describe("cloud backup card", () => {
  it("invites walk-in guests to sign in and keeps upload disabled", () => {
    render(<CloudBackup />);
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/signin");
    expect(screen.getByRole("button", { name: /back up now/i })).toBeDisabled();
  });

  it("lists a member's parcels with date and European size format", () => {
    mocks.auth.isAuthenticated = true;
    mocks.list.data = [parcel];
    render(<CloudBackup />);
    const row = screen.getByRole("listitem");
    expect(within(row).getByText(/Laptop/)).toBeInTheDocument();
    expect(within(row).getByText(/2026\/10\/21/)).toBeInTheDocument();
    expect(within(row).getByText(/36 records/)).toBeInTheDocument();
    expect(within(row).getByText(/12,5 KB/)).toBeInTheDocument();
  });

  it("uploads with the device label", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.list.data = [];
    mocks.upload.mockResolvedValue(parcel);
    const user = userEvent.setup();
    render(<CloudBackup />);
    await user.type(screen.getByLabelText(/device label/i), "Laptop");
    await user.click(screen.getByRole("button", { name: /back up now/i }));
    expect(mocks.upload).toHaveBeenCalledWith("Laptop");
    expect(mocks.toastSuccess).toHaveBeenCalled();
  });

  it("restores only after confirmation", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.list.data = [parcel];
    mocks.restore.mockResolvedValue(parcel);
    const user = userEvent.setup();
    render(<CloudBackup />);
    await user.click(screen.getByRole("button", { name: /restore backup from/i }));
    expect(mocks.restore).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /replace device data/i }));
    expect(mocks.restore).toHaveBeenCalledWith(parcel.id);
  });

  it("deletes only after confirmation", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.list.data = [parcel];
    mocks.remove.mockResolvedValue({ id: parcel.id });
    const user = userEvent.setup();
    render(<CloudBackup />);
    await user.click(screen.getByRole("button", { name: /delete backup from/i }));
    expect(mocks.remove).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /^delete backup$/i }));
    expect(mocks.remove).toHaveBeenCalledWith(parcel.id);
  });

  it("shows a friendly toast when upload fails", async () => {
    mocks.auth.isAuthenticated = true;
    mocks.list.data = [];
    mocks.upload.mockRejectedValue(new Error("The mailbox is temporarily unavailable. Please try again."));
    const user = userEvent.setup();
    render(<CloudBackup />);
    await user.click(screen.getByRole("button", { name: /back up now/i }));
    expect(mocks.toastError).toHaveBeenCalledWith("The mailbox is temporarily unavailable. Please try again.");
  });

  it("shows list errors with a retry", () => {
    mocks.auth.isAuthenticated = true;
    mocks.list.isError = true;
    mocks.list.error = new Error("The mailbox is temporarily unavailable. Please try again.");
    render(<CloudBackup />);
    expect(screen.getByRole("alert")).toHaveTextContent(/try again/);
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
