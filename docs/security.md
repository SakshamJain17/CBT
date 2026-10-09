# Security

- RLS is enabled on every application table.
- Anonymous access is read-only and limited to public catalogue inputs/view fields.
- Members, loans, staff data, digitization notes, audit logs, and internal copy notes have no anonymous grants.
- Staff authorization comes from `profiles` and `staff_roles` in PostgreSQL.
- The private role helper checks `auth.uid()` and is not exposed to anonymous users.
- Atomic circulation functions are executable only by authenticated users and perform their own librarian-role checks.
- The public application uses only a publishable key. Never add a secret or service-role key to `NEXT_PUBLIC_*` variables.

RLS has not been integration-tested until the local Supabase stack is run and the database tests are added/executed.
