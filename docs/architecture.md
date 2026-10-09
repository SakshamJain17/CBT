# Architecture

The application is a Next.js server application backed by Supabase. Route handlers validate HTTP input and call small service modules. Services use the request's Supabase session, while PostgreSQL remains the final authority through constraints, RLS, and transaction-safe functions.

## Boundaries

- `frontend/app/api`: HTTP only—validation, status codes, response envelopes.
- `frontend/lib/services`: database queries and reusable application operations.
- `frontend/lib/validation`: Zod request schemas.
- `frontend/lib/auth`: authenticated staff and role checks.
- `backend/supabase/migrations`: portable PostgreSQL schema, permissions, and functions.
- `backend/supabase/seed.sql`: clearly fictional local data.

The browser never receives a service-role/secret key. Staff permissions are read from database-backed roles, not browser-supplied metadata.
