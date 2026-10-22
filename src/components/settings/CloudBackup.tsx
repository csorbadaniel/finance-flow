import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/useAuth";
import {
  useCloudBackups,
  useDeleteBackup,
  useRestoreBackup,
  useUploadBackup,
} from "@/lib/cloud/useCloudBackups";

interface BackupParcel {
  id: string;
  created_at: string;
  device_label: string | null;
  record_count: number;
  size_bytes: number;
}

type PendingAction = { kind: "restore" | "delete"; parcel: BackupParcel } | null;

const pad = (value: number) => String(value).padStart(2, "0");

/** Formats a timestamp as YYYY/MM/DD HH:mm in local time. */
export function formatBackupDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Formats a size in KB/MB with a comma decimal separator. */
export function formatBackupSize(bytes: number): string {
  const format = (value: number) =>
    new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format(value);
  return bytes >= 1024 * 1024 ? `${format(bytes / (1024 * 1024))} MB` : `${format(bytes / 1024)} KB`;
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

/** Manual cloud snapshots for signed-in members; guests see a sign-in invitation. */
export function CloudBackup() {
  const { isAuthenticated } = useAuth();
  const backups = useCloudBackups(isAuthenticated);
  const upload = useUploadBackup();
  const restore = useRestoreBackup();
  const remove = useDeleteBackup();
  const [deviceLabel, setDeviceLabel] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);

  const parcels = (backups.data ?? []) as BackupParcel[];

  const handleUpload = async () => {
    try {
      await upload.mutateAsync(deviceLabel.trim());
      toast.success("Backup saved to the cloud");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleConfirm = async () => {
    if (!pending) return;
    const { kind, parcel } = pending;
    setPending(null);
    try {
      if (kind === "restore") {
        await restore.mutateAsync(parcel.id);
        toast.success(`Restored ${parcel.record_count} records`);
      } else {
        await remove.mutateAsync(parcel.id);
        toast.success("Backup deleted");
      }
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="space-y-3">
      {!isAuthenticated && (
        <p className="text-sm text-muted-foreground">
          <Link to="/signin" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to keep up to 10 backups in your private cloud mailbox. The app works fully without an
          account.
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <Label htmlFor="backup-device-label" className="text-xs text-muted-foreground">
            Device label (optional)
          </Label>
          <Input
            id="backup-device-label"
            value={deviceLabel}
            maxLength={60}
            placeholder="For example, Laptop"
            disabled={!isAuthenticated}
            onChange={(event) => setDeviceLabel(event.target.value)}
          />
        </div>
        <Button disabled={!isAuthenticated || upload.isPending} onClick={() => void handleUpload()}>
          {upload.isPending ? "Backing up…" : "Back up now"}
        </Button>
      </div>

      {isAuthenticated && backups.isLoading && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Loading backups…
        </p>
      )}

      {isAuthenticated && backups.isError && (
        <div role="alert" className="flex items-center justify-between gap-2 rounded-md border border-destructive/40 p-2 text-sm">
          <span>{errorMessage(backups.error)}</span>
          <Button variant="outline" size="sm" onClick={() => void backups.refetch()}>
            Retry
          </Button>
        </div>
      )}

      {isAuthenticated && !backups.isLoading && !backups.isError && parcels.length === 0 && (
        <p className="text-sm text-muted-foreground">No cloud backups yet.</p>
      )}

      {parcels.length > 0 && (
        <ul className="divide-y divide-border rounded-md border border-border" aria-label="Cloud backups">
          {parcels.map((parcel) => {
            const when = formatBackupDate(parcel.created_at);
            return (
              <li key={parcel.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium tabular-nums">
                    {when}
                    {parcel.device_label && (
                      <span className="ml-2 text-muted-foreground">· {parcel.device_label}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {parcel.record_count} records · {formatBackupSize(parcel.size_bytes)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`Restore backup from ${when}`}
                    disabled={restore.isPending}
                    onClick={() => setPending({ kind: "restore", parcel })}
                  >
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete backup from ${when}`}
                    disabled={remove.isPending}
                    onClick={() => setPending({ kind: "delete", parcel })}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.kind === "restore" ? "Restore this backup?" : "Delete this backup?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.kind === "restore"
                ? "Your current records, categories and purses on this device will be replaced. Consider backing up first."
                : "This backup will be removed from your cloud mailbox. Data on this device is not affected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirm()}>
              {pending?.kind === "restore" ? "Replace device data" : "Delete backup"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
