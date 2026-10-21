import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { backupIdSchema, uploadBackupSchema } from "./backupValidation";
import { deleteBackupParcel, getBackupParcel, listBackupParcels, uploadBackupParcel } from "./backups.server";

export const listBackups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => listBackupParcels(context));

export const uploadBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadBackupSchema.parse(input))
  .handler(async ({ data, context }) => uploadBackupParcel(context, { payload: data.payload, deviceLabel: data.deviceLabel }));

export const getBackup = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => backupIdSchema.parse(input))
  .handler(async ({ data, context }) => getBackupParcel(context, data.id));

export const deleteBackup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => backupIdSchema.parse(input))
  .handler(async ({ data, context }) => deleteBackupParcel(context, data.id));