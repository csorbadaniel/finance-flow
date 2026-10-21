import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { exampleBackup } from "@/lib/finance/backup";
import { financeStore } from "@/lib/finance/store";

const mocks = vi.hoisted(() => ({
  listBackups: vi.fn(),
  uploadBackup: vi.fn(),
  getBackup: vi.fn(),
  deleteBackup: vi.fn(),
}));
vi.mock("./backups.functions", () => mocks);
vi.mock("@tanstack/react-start", () => ({ useServerFn: <T,>(fn: T) => fn }));

import { useCloudBackups, useDeleteBackup, useRestoreBackup, useUploadBackup } from "./useCloudBackups";

const summary = {
  id: "11111111-1111-4111-8111-111111111111", created_at: "2026-10-21T09:19:00Z", format_version: 1,
  device_label: null, record_count: 2, category_count: 3, purse_count: 2, currency: "HUF", size_bytes: 1000,
};

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => vi.clearAllMocks());

describe("cloud backup hooks", () => {
  it("does not reach the mailbox for walk-in guests", () => {
    const { result } = renderHook(() => useCloudBackups(false), { wrapper: wrapper() });
    expect(mocks.listBackups).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it("lists parcels for members", async () => {
    mocks.listBackups.mockResolvedValue([summary]);
    const { result } = renderHook(() => useCloudBackups(true), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([summary]);
  });

  it("exposes list errors", async () => {
    mocks.listBackups.mockRejectedValue(new Error("The mailbox is temporarily unavailable. Please try again."));
    const { result } = renderHook(() => useCloudBackups(true), { wrapper: wrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toMatch(/try again/);
  });

  it("uploads the current device data", async () => {
    mocks.uploadBackup.mockResolvedValue(summary);
    const { result } = renderHook(() => useUploadBackup(), { wrapper: wrapper() });
    await act(() => result.current.mutateAsync("Laptop"));
    const sent = mocks.uploadBackup.mock.calls[0][0].data;
    const state = financeStore.getState();
    expect(sent.deviceLabel).toBe("Laptop");
    expect(sent.payload.transactions).toHaveLength(state.transactions.length);
    expect(sent.payload.currency).toBe(state.currency);
  });

  it("restores a parcel into device storage", async () => {
    mocks.getBackup.mockResolvedValue({ backup: summary, payload: { ...exampleBackup, currency: "EUR" } });
    const { result } = renderHook(() => useRestoreBackup(), { wrapper: wrapper() });
    await act(() => result.current.mutateAsync(summary.id));
    expect(mocks.getBackup).toHaveBeenCalledWith({ data: { id: summary.id } });
    expect(financeStore.getState().transactions).toHaveLength(exampleBackup.transactions.length);
    expect(financeStore.getState().currency).toBe("EUR");
  });

  it("leaves device storage untouched when restore fails", async () => {
    const before = financeStore.getState().transactions.length;
    mocks.getBackup.mockRejectedValue(new Error("Backup parcel not found."));
    const { result } = renderHook(() => useRestoreBackup(), { wrapper: wrapper() });
    await expect(act(() => result.current.mutateAsync(summary.id))).rejects.toThrow(/not found/);
    expect(financeStore.getState().transactions).toHaveLength(before);
  });

  it("deletes one parcel", async () => {
    mocks.deleteBackup.mockResolvedValue({ id: summary.id });
    const { result } = renderHook(() => useDeleteBackup(), { wrapper: wrapper() });
    await act(() => result.current.mutateAsync(summary.id));
    expect(mocks.deleteBackup).toHaveBeenCalledWith({ data: { id: summary.id } });
  });
});
