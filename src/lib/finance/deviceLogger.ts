export type DeviceMutationAction =
  | "add_record" | "update_record" | "delete_record"
  | "add_category" | "rename_category" | "delete_category"
  | "add_purse" | "rename_purse" | "set_default_purse" | "delete_purse"
  | "set_onboarding" | "set_currency" | "replace_data";

/** Deliberately accepts no payloads, identifiers, notes, amounts or raw errors. */
export function logDeviceMutation(action: DeviceMutationAction, event: "success" | "failure"): void {
  const entry = { scope: "device_finance", action, event };
  if (event === "failure") console.error(entry);
  else console.info(entry);
}