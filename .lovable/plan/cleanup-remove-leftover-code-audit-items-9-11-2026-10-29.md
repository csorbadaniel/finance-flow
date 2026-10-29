# Cleanup: remove leftover code (audit items 9–11)

Nothing the user sees changes. Goal: fewer files, smaller app download, no test-only code shipped to users.

## 1. Template leftovers (item 9)
- Delete `src/lib/api/example.functions.ts` (greeting example, unused) and `src/lib/config.server.ts` (only used by that example).
- Keep `drizzle.config.ts` and `drizzle/` — they hold the cloud backup migration, so they are not leftovers (audit corrected).

## 2. Test-only reset (item 10)
- Remove `resetToMock()` from the finance store.
- Add `src/test/resetFinanceStore.ts` that resets via the public `replaceData` + `setOnboardingSeen` with the mock data; update the 7 test files that call it.

## 3. Unused UI kit pieces (item 11)
Delete these components nobody imports: accordion, alert, aspect-ratio, avatar, badge, breadcrumb, calendar, carousel, chart, checkbox, collapsible, command, context-menu, drawer, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, progress, resizable, scroll-area, sidebar, slider, switch, table, tabs, toggle-group — plus `src/hooks/use-mobile.tsx` (only used by sidebar). Re-check each with a search right before deleting; uninstall packages only those files needed (e.g. embla-carousel, input-otp, cmdk, vaul, react-resizable-panels, react-day-picker), confirmed by search.

## Verification
- Full test suite passes (currently 107).
- Build log clean.
- Quick preview check of Home, Records, Charts and Settings with no console errors.
- Update `roadmap.md` with the cleanup task.
