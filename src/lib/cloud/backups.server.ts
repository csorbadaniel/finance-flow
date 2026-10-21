import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, Tables } from "@/integrations/supabase/types";
import { BACKUP_VERSION, type BackupData } from "@/lib/finance/backup";
import { MAX_CLOUD_BACKUPS, prepareCloudPayload, validateCloudPayload } from "./backupValidation";

export type BackupSummary = Omit<Tables<"backups">, "payload" | "user_id">;
interface BackupContext { supabase: SupabaseClient<Database>; userId: string }
const summaryColumns = "id,created_at,format_version,device_label,record_count,category_count,purse_count,currency,size_bytes";
type Action = "list" | "upload" | "get" | "delete";

async function loggedOperation<T>(action: Action, operation: () => Promise<T>): Promise<T> {
  const startedAt = Date.now();
  console.info({ scope: "cloud_backup", action, event: "entry" });
  try {
    const result = await operation();
    console.info({ scope: "cloud_backup", action, event: "exit", duration_ms: Date.now() - startedAt });
    return result;
  } catch (error) {
    // Never log payloads, financial notes, tokens or raw database error messages.
    console.error({ scope: "cloud_backup", action, event: "failure", duration_ms: Date.now() - startedAt });
    throw error;
  }
}

function databaseFailure(action: Action, error: { code?: string }): never {
  console.error({ scope: "cloud_backup", action, event: "database_failure", code: error.code });
  throw new Error("The mailbox is temporarily unavailable. Please try again.");
}

export async function listBackupParcels(context: BackupContext): Promise<BackupSummary[]> {
  return loggedOperation("list", async () => {
    const { data, error } = await context.supabase.from("backups").select(summaryColumns)
      .eq("user_id", context.userId).order("created_at", { ascending: false })
      .order("id", { ascending: false }).limit(MAX_CLOUD_BACKUPS);
    if (error) databaseFailure("list", error);
    return data ?? [];
  });
}

export async function uploadBackupParcel(context: BackupContext, input: { payload: unknown; deviceLabel?: string }): Promise<BackupSummary> {
  return loggedOperation("upload", async () => {
    const { payload, sizeBytes } = prepareCloudPayload(input.payload);
    const { data, error } = await context.supabase.from("backups").insert({
      user_id: context.userId, format_version: BACKUP_VERSION,
      device_label: input.deviceLabel?.trim() || null,
      record_count: payload.transactions.length, category_count: payload.categories.length,
      purse_count: payload.purses.length, currency: payload.currency ?? "HUF", size_bytes: sizeBytes,
      payload: JSON.parse(JSON.stringify(payload)) as Json,
    }).select(summaryColumns).single();
    if (error) databaseFailure("upload", error);
    if (!data) throw new Error("The parcel could not be uploaded. Please try again.");
    return data;
  });
}

export async function getBackupParcel(context: BackupContext, id: string): Promise<{ backup: BackupSummary; payload: BackupData }> {
  return loggedOperation("get", async () => {
    const { data, error } = await context.supabase.from("backups").select(`${summaryColumns},payload`)
      .eq("user_id", context.userId).eq("id", id).maybeSingle();
    if (error) databaseFailure("get", error);
    if (!data) throw new Error("Backup parcel not found.");
    if (data.format_version !== BACKUP_VERSION) throw new Error("This backup format is not supported.");
    const { payload, ...backup } = data;
    return { backup, payload: validateCloudPayload(payload) };
  });
}

export async function deleteBackupParcel(context: BackupContext, id: string): Promise<{ id: string }> {
  return loggedOperation("delete", async () => {
    const { data, error } = await context.supabase.from("backups").delete()
      .eq("user_id", context.userId).eq("id", id).select("id").maybeSingle();
    if (error) databaseFailure("delete", error);
    if (!data) throw new Error("Backup parcel not found.");
    return { id: data.id };
  });
}