# API

All responses use `{ "data": ..., "error": null }` or `{ "data": null, "error": { "code": "...", "message": "..." } }`.

## Public

`GET /api/catalogue`

Query parameters: `q`, `language`, `category`, `available=true|false`, `page` (default 1), and `pageSize` (default 20, maximum 50).

## Staff

`GET /api/staff/me` confirms the current Supabase session and returns database-backed staff roles. It returns 401 without a session and 403 for an authenticated user without an active staff profile/role.

More catalogue, circulation, digitization, and reporting routes will reuse the existing service/auth layers. Atomic issue and return database functions already exist for these routes.
