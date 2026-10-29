# FinanceFlow code audit — findings and fix order

This is a read-only review. No code changes until you approve a step.

## Overall verdict
The app is in good shape: small files (largest is the store, 346 lines), no `any` in app code, no hardcoded colours outside the shared UI kit, and the cloud backup layer is cleanly split (validation, server helpers, server functions, hooks, card). The issues below are mostly "added next to old code" leftovers and a few silent-failure spots.

Security: the last automated scans (Sept/Oct) found nothing, but they are out of date and predate the backup feature. Run a fresh scan from the Security tab before publishing — I can't call the app secure without it.

---

## 1. Critical fixes

1. **Device saves can fail silently.** If the browser storage is full or blocked, saving quietly does nothing and the user believes the record is stored (store `saveState` swallows the error). Fix: report the failure to the screen (toast: "Couldn't save on this device").
2. **Corrupted device data is silently replaced by demo data.** If saved data can't be read, the app loads the sample records instead, and the next save overwrites the user's real data. Fix: keep the raw copy aside, start empty, and tell the user.
3. **Demo/sample data is the production starting state.** New users and the server render both start from the 36 mock records (`initialFinanceState` used by store and `useFinance`). Decide: real empty start (with one default purse + starter categories) vs. demo mode; keep mock records for tests only.
4. **Cloud calls have no time limit.** Upload/restore/list requests can spin forever on a dead connection — buttons stay in "working" state with no message. Fix: add a timeout and a friendly "took too long, try again" error to the backup hooks.

## 2. Important fixes

5. **Duplicate logic (DRY):**
   - "Date as YYYY-MM-DD / YYYY/MM/DD" built by hand in 4 places (QuickAddDialog, selectors, charts, CloudBackup `formatBackupDate`). One date utility.
   - "All subcategories of a category" walked in 3 places (store twice, selectors once). One shared helper.
   - Two payload checkers: file import (`backup.ts`) and cloud (`backupValidation.ts`) validate the same shape with different rules (cloud is stricter). Make file import use the same schema so a file accepted locally is accepted by the cloud and vice versa.
6. **Hand-copied types:** `CloudBackup.tsx` redeclares a `BackupParcel` type instead of using the server's `BackupSummary`. If the shelf changes, the card won't notice. Import the real type.
7. **Business rules inside the store class, not in a testable module:** validation messages and rules (positive amount, name required, duplicate names) live inline in the store; dialogs repeat some of them for field errors. Extract a small `finance/rules.ts` used by both.
8. **Inconsistent error copy:** dialogs fall back to "Something went wrong" while others use specific text. Standardise friendly messages per action.

## 3. Cleanup (ghost code)

9. Delete template leftovers: `src/lib/api/example.functions.ts` (greeting example), `drizzle.config.ts` + `drizzle/schema.ts` if not used by the migration workflow, and check `src/lib/config.server.ts` is still needed.
10. `resetToMock()` in the store is test-only but ships to users — move to a test helper.
11. Remove unused shadcn UI components (carousel, calendar, drawer, etc.) that no page imports, to cut bundle size.
12. Pre-existing hydration warning in runtime logs (light/dark theme read before hydration) — fix so first paint doesn't flicker.

## 4. Organisation

13. Move mock data out of `lib/finance/` into `src/test/fixtures/` once item 3 is decided.
14. Guest vs member data shapes are already separate (device `FinanceState` vs cloud `BackupSummary`/`BackupFile`); document this in `AGENTS.md` and add a `types` barrel for cloud types. There is no premium tier yet — no shape to separate.
15. No Edge Functions needed: server logic correctly lives in server functions per project rules.

## 5. Optional polish

16. Logging: device-side mutations have no structured logs (only cloud does). Add a tiny logger used by store and hooks.
17. Add tests for the silent-failure fixes (storage full, corrupted data, timeout).
18. `QuickAddDialog` and `RecordEditDialog` share most form fields — extract a shared `TransactionForm`.

---

## Suggested order of work
Each step keeps the app working; I'd run all tests and check the affected page in the preview after each.
1. Cleanup (items 9–11) — lowest risk.
2. Silent failures (1, 2, 4) with failing tests first.
3. Starting data decision (3, 13) — needs your answer.
4. DRY merges (5, 6, 7, 18).
5. Polish (8, 12, 16, 17).
