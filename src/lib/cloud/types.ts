import type { Tables } from "@/integrations/supabase/types";

/** Backup metadata shown in lists; never includes the payload or owner id. */
export type BackupSummary = Omit<Tables<"backups">, "payload" | "user_id">;
