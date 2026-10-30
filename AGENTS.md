# Architecture rules

- Device storage (localStorage finance store) is the source of truth; the cloud `backups` table only holds manual, user-triggered snapshots (max 10 per user, trimmed by trigger). Why: accounts are optional and no feature may depend on being online or signed in.
- Cloud backup access goes through `requireSupabaseAuth` server functions using the RLS-scoped client, never the admin client. Why: the server must not trust the client, and owner-only row rules stay the guard.
- Cloud RPC wrappers delegate to server-only parcel helpers; a shared schema validates snapshots before writes and restores, and metadata is derived server-side. Why: malformed or caller-forged parcel labels must never become trusted finance data.
- Keep production starting state separate from test fixtures; load optional sample records through a lazy demo module and merge them only into a record-free device, preserving categories, purses and preferences. Why: new users must never receive automatic demo transactions or lose personal data when trying the demo.
