# Cloud backup roadmap

- [x] Block 1: mailbox table, owner-only access and keep-10 rule.
- [x] Block 2: authenticated backup clerk and validation tests; 93 tests pass, signed-in upload/list/get/delete and signed-out rejection verified.
- [x] Block 3: backup hooks; 7 tests.
- [x] Block 4: Cloud backup card in Settings; 107 tests pass.
- [x] Block 5: guest check plus signed-in upload, restore on cleared device and delete verified in the preview.- [x] Cleanup: removed template leftovers, test-only store reset, 30 unused UI components and 24 packages.

## Starting data
- [ ] Start new devices without sample transactions, preserve saved data, and move test fixtures out of production startup.
- [ ] Add an explicit, non-destructive demo choice in Settings; test and verify it in the preview, then pause for approval.
