import { z } from "zod";
import { BACKUP_VERSION, parseJsonBackup, type BackupData, type BackupFile } from "@/lib/finance/backup";
import { DEFAULT_CURRENCY } from "@/lib/finance/currency";

export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export const MAX_CLOUD_BACKUPS = 10;
export const backupIdSchema = z.object({ id: z.string().uuid() }).strict();
export const uploadBackupSchema = z.object({
  payload: z.unknown(),
  deviceLabel: z.string().trim().max(60).optional(),
}).strict();

const identifier = z.string().min(1);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const payloadSchema = z.object({
  version: z.literal(BACKUP_VERSION).optional(),
  exportedAt: z.string().datetime({ offset: true }).optional(),
  currency: z.enum(["HUF", "EUR", "USD", "GBP"]).optional(),
  categories: z.array(z.object({
    id: identifier, name: z.string().trim().min(1), parentId: identifier.nullable(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]), icon: z.string().optional(),
  })).min(1),
  purses: z.array(z.object({ id: identifier, name: z.string().trim().min(1), isDefault: z.boolean() })).min(1),
  transactions: z.array(z.object({
    id: identifier, recordNumber: identifier, type: z.enum(["income", "expense"]),
    amount: z.number().finite().positive(), categoryId: identifier, purseId: identifier,
    date, note: z.string().optional(), createdAt: z.string().datetime({ offset: true }),
  })),
});

export function validateCloudPayload(input: unknown): BackupData {
  let serialized: string | undefined;
  try { serialized = JSON.stringify(input); } catch { throw new Error("This parcel is not a valid backup."); }
  if (!serialized) throw new Error("This parcel is not a valid backup.");
  if (new TextEncoder().encode(serialized).byteLength >= MAX_BACKUP_BYTES) {
    throw new Error("Backup parcels must be smaller than 5 MB.");
  }
  const result = payloadSchema.safeParse(input);
  if (!result.success) throw new Error("This parcel contains invalid backup data or an unsupported format.");
  const data = result.data;
  for (const entities of [data.categories, data.purses, data.transactions]) {
    if (new Set(entities.map((entity) => entity.id)).size !== entities.length) {
      throw new Error("This parcel contains duplicate identifiers.");
    }
  }
  const categories = new Map(data.categories.map((category) => [category.id, category]));
  for (const category of data.categories) {
    const parent = category.parentId === null ? undefined : categories.get(category.parentId);
    if (category.parentId === null ? category.level !== 1 : !parent || parent.level + 1 !== category.level) {
      throw new Error("This parcel contains an invalid category tree.");
    }
  }
  if (data.purses.filter((purse) => purse.isDefault).length > 1) {
    throw new Error("This parcel contains more than one default purse.");
  }
  // Reuse the file-import reference checks and legacy default-purse normalization.
  return parseJsonBackup(JSON.stringify({ ...data, currency: data.currency ?? DEFAULT_CURRENCY }));
}

export function prepareCloudPayload(input: unknown): { payload: BackupFile; sizeBytes: number } {
  const data = validateCloudPayload(input);
  const payload: BackupFile = { ...data, version: BACKUP_VERSION, exportedAt: new Date().toISOString() };
  const sizeBytes = new TextEncoder().encode(JSON.stringify(payload)).byteLength;
  if (sizeBytes >= MAX_BACKUP_BYTES) throw new Error("Backup parcels must be smaller than 5 MB.");
  return { payload, sizeBytes };
}