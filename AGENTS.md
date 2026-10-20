# Architecture rules

- Device storage (localStorage finance store) is the source of truth; the cloud `backups` table only holds manual, user-triggered snapshots (max 10 per user, trimmed by trigger). Why: accounts are optional and no feature may depend on being online or signed in.
- Cloud backup access goes through `requireSupabaseAuth` server functions using the RLS-scoped client, never the admin client. Why: the server must not trust the client, and owner-only row rules stay the guard.
