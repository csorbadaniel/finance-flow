/** Preserve actionable errors; use a recoverable fallback for unknown failures. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  return error instanceof Error && error.message.trim() ? error.message : fallback;
}