import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { exampleBackup, toJson } from "@/lib/finance/backup";

const mocks = vi.hoisted(() => {
  const query = {
    select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn(),
    insert: vi.fn(), delete: vi.fn(), single: vi.fn(), maybeSingle: vi.fn(),
  };
  return { query, from: vi.fn(), authenticated: true, guard: { name: "auth" }, guarded: vi.fn() };
});

vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: mocks.guard }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let guards: unknown[] = [];
    let validate: (input: unknown) => unknown = (input) => input;
    const builder = {
      middleware: (items: unknown[]) => { guards = items; return builder; },
      inputValidator: (validator: (input: unknown) => unknown) => { validate = validator; return builder; },
      handler: (handler: (args: { data: unknown; context: { supabase: SupabaseClient<Database>; userId: string } }) => unknown) =>
        async (input?: { data?: unknown }) => {
          mocks.guarded(guards);
          if (!guards.includes(mocks.guard) || !mocks.authenticated) throw new Error("Unauthorized");
          return handler({ data: validate(input?.data), context: {
            supabase: { from: mocks.from } as unknown as SupabaseClient<Database>, userId: "owner-id",
          } });
        },
    };
    return builder;
  },
}));

import { deleteBackup, getBackup, listBackups, uploadBackup } from "./backups.functions";

const backupId = "11111111-1111-4111-8111-111111111111";
const metadata = {
  id: backupId, created_at: "2026-10-21T09:19:00.000Z", format_version: 1,
  device_label: "Laptop", record_count: 2, category_count: 3, purse_count: 2,
  currency: "HUF", size_bytes: 1000,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authenticated = true;
  mocks.from.mockReturnValue(mocks.query);
  for (const method of ["select", "eq", "order", "insert", "delete"] as const) {
    mocks.query[method].mockReturnValue(mocks.query);
  }
  mocks.query.limit.mockResolvedValue({ data: [metadata], error: null });
  mocks.query.single.mockResolvedValue({ data: metadata, error: null });
  mocks.query.maybeSingle.mockResolvedValue({ data: { ...metadata, payload: JSON.parse(toJson(exampleBackup)) }, error: null });
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("cloud backup clerk", () => {
  it.each(["list", "upload", "get", "delete"] as const)("requires sign-in for %s", async (action) => {
    mocks.authenticated = false;
    const calls = {
      list: () => listBackups(), upload: () => uploadBackup({ data: { payload: exampleBackup } }),
      get: () => getBackup({ data: { id: backupId } }), delete: () => deleteBackup({ data: { id: backupId } }),
    };
    await expect(calls[action]()).rejects.toThrow("Unauthorized");
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.guarded).toHaveBeenCalledWith([mocks.guard]);
  });

  it("lists only this owner's ten newest parcels without their payloads", async () => {
    expect(await listBackups()).toEqual([metadata]);
    expect(mocks.query.eq).toHaveBeenCalledWith("user_id", "owner-id");
    expect(mocks.query.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(mocks.query.order).toHaveBeenCalledWith("id", { ascending: false });
    expect(mocks.query.limit).toHaveBeenCalledWith(10);
    expect(mocks.query.select.mock.calls[0][0]).not.toContain("payload");
  });

  it("computes owner, counts, currency, format and UTF-8 size on upload", async () => {
    await uploadBackup({ data: { payload: exampleBackup, deviceLabel: " Laptop " } });
    const inserted = mocks.query.insert.mock.calls[0][0];
    expect(inserted).toMatchObject({ user_id: "owner-id", record_count: 2, category_count: 3,
      purse_count: 2, currency: "HUF", format_version: 1, device_label: "Laptop" });
    expect(inserted.size_bytes).toBe(new TextEncoder().encode(JSON.stringify(inserted.payload)).byteLength);
    expect(inserted.payload.version).toBe(1);
    expect(inserted.payload.transactions).toEqual(exampleBackup.transactions);
  });

  it("uses HUF when an older device snapshot omits currency", async () => {
    const { currency: _currency, ...legacy } = exampleBackup;
    await uploadBackup({ data: { payload: legacy } });
    expect(mocks.query.insert.mock.calls[0][0].currency).toBe("HUF");
  });

  it.each([
    { ...exampleBackup, transactions: [{ ...exampleBackup.transactions[0], amount: -1 }] },
    { ...exampleBackup, transactions: [{ ...exampleBackup.transactions[0], categoryId: "missing" }] },
    { ...exampleBackup, transactions: [{ ...exampleBackup.transactions[0], type: "invalid" }] },
    { ...exampleBackup, currency: "INVALID" },
    { ...exampleBackup, categories: [null] },
    { ...exampleBackup, transactions: [{ ...exampleBackup.transactions[0], date: "2026-02-30" }] },
    { ...exampleBackup, purses: [exampleBackup.purses[0], exampleBackup.purses[0]] },
  ])("rejects malformed contents before reaching the mailbox", async (payload) => {
    await expect(uploadBackup({ data: { payload } })).rejects.toThrow();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rejects parcels at or above 5 MiB", async () => {
    const payload = { ...exampleBackup, transactions: [{ ...exampleBackup.transactions[0], note: "x".repeat(5 * 1024 * 1024) }] };
    await expect(uploadBackup({ data: { payload } })).rejects.toThrow(/5 MB/);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rejects device labels longer than 60 characters", async () => {
    await expect(uploadBackup({ data: { payload: exampleBackup, deviceLabel: "x".repeat(61) } })).rejects.toThrow();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("retrieves and validates the owner's parcel without changing device storage", async () => {
    const result = await getBackup({ data: { id: backupId } });
    expect(result.payload).toEqual(exampleBackup);
    expect(mocks.query.eq).toHaveBeenCalledWith("id", backupId);
    expect(mocks.query.eq).toHaveBeenCalledWith("user_id", "owner-id");
    expect(localStorage.length).toBe(0);
  });

  it("rejects unsupported stored formats before restore", async () => {
    mocks.query.maybeSingle.mockResolvedValue({ data: { ...metadata, format_version: 2, payload: JSON.parse(toJson(exampleBackup)) }, error: null });
    await expect(getBackup({ data: { id: backupId } })).rejects.toThrow(/format/i);
  });

  it("rejects damaged stored contents", async () => {
    mocks.query.maybeSingle.mockResolvedValue({ data: { ...metadata, payload: { version: 1 } }, error: null });
    await expect(getBackup({ data: { id: backupId } })).rejects.toThrow();
  });

  it.each(["get", "delete"] as const)("does not reveal missing or another owner's parcel on %s", async (action) => {
    mocks.query.maybeSingle.mockResolvedValue({ data: null, error: null });
    const fn = action === "get" ? getBackup : deleteBackup;
    await expect(fn({ data: { id: backupId } })).rejects.toThrow(/not found/i);
    expect(mocks.query.eq).toHaveBeenCalledWith("user_id", "owner-id");
  });

  it("deletes only the requested owner's parcel", async () => {
    mocks.query.maybeSingle.mockResolvedValue({ data: { id: backupId }, error: null });
    expect(await deleteBackup({ data: { id: backupId } })).toEqual({ id: backupId });
    expect(mocks.query.delete).toHaveBeenCalledOnce();
    expect(mocks.query.eq).toHaveBeenCalledWith("id", backupId);
    expect(mocks.query.eq).toHaveBeenCalledWith("user_id", "owner-id");
  });

  it.each(["get", "delete"] as const)("rejects invalid tracking numbers for %s", async (action) => {
    const fn = action === "get" ? getBackup : deleteBackup;
    await expect(fn({ data: { id: "invalid" } })).rejects.toThrow();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it.each(["list", "upload", "get", "delete"] as const)("handles a mailbox failure safely during %s", async (action) => {
    const failure = { data: null, error: { code: "42501", message: "private provider details" } };
    mocks.query.limit.mockResolvedValue(failure);
    mocks.query.single.mockResolvedValue(failure);
    mocks.query.maybeSingle.mockResolvedValue(failure);
    const calls = {
      list: () => listBackups(), upload: () => uploadBackup({ data: { payload: exampleBackup } }),
      get: () => getBackup({ data: { id: backupId } }), delete: () => deleteBackup({ data: { id: backupId } }),
    };
    await expect(calls[action]()).rejects.toThrow(/try again/i);
    expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain("Monthly salary");
  });
});