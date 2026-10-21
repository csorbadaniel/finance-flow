import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { financeStore } from "@/lib/finance/store";
import type { BackupData } from "@/lib/finance/backup";
import { deleteBackup, getBackup, listBackups, uploadBackup } from "./backups.functions";

export const cloudBackupsKey = ["cloud-backups"] as const;

/** The member's parcel list, newest first. Disabled for walk-in guests. */
export function useCloudBackups(isAuthenticated: boolean) {
  const list = useServerFn(listBackups);
  return useQuery({ queryKey: cloudBackupsKey, queryFn: () => list(), enabled: isAuthenticated });
}

/** Packs the current device data into a parcel and drops it off. */
export function useUploadBackup() {
  const upload = useServerFn(uploadBackup);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deviceLabel?: string) => {
      const { categories, purses, transactions, currency } = financeStore.getState();
      const payload: BackupData = { categories, purses, transactions, currency };
      return upload({ data: { payload, deviceLabel: deviceLabel || undefined } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cloudBackupsKey }),
  });
}

/** Fetches a server-validated parcel and replaces device data with it. */
export function useRestoreBackup() {
  const fetchBackup = useServerFn(getBackup);
  return useMutation({
    mutationFn: async (id: string) => {
      const { backup, payload } = await fetchBackup({ data: { id } });
      financeStore.replaceData(payload);
      return backup;
    },
  });
}

/** Removes one parcel from the member's mailbox. */
export function useDeleteBackup() {
  const remove = useServerFn(deleteBackup);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cloudBackupsKey }),
  });
}
