# CBT Digital Library

Full-stack pilot for Children’s Book Trust’s physical library catalogue. It separates a title from its physical copies and never treats a handwritten register entry as proof that a copy is currently available.

## Repository structure

```text
CBT/
├── frontend/              Next.js application and web API routes
│   ├── app/page.tsx       Index page for `/`
│   ├── app/login/         Librarian sign-in
│   ├── app/librarian/     Protected staff workspace
│   ├── components/        Interactive React components
│   └── lib/               Validation, services and Supabase clients
├── backend/
│   └── supabase/          Database config, migrations and seed data
├── docs/                  Architecture and operating documentation
└── package.json           Convenience commands for both folders
```

Next.js App Router does not use `index.html`. The website’s index page is `frontend/app/page.tsx`, which serves `/`.

## First milestone

- PostgreSQL schema for staff roles, catalogue, copies, shelves, members, circulation, digitization, verification, and audits.
- Public catalogue view where availability comes only from shelf-verified copies.
- Atomic issue and return database functions.
- RLS and explicit grants that keep borrower and internal data private.
- Minimal public catalogue and staff-session APIs.
- Fictional local seed data.
- Responsive public catalogue frontend with live search.
- Supabase email/password librarian sign-in and protected workspace overview.

Frontend routes:

- `/` — public catalogue and pilot explanation.
- `/login` — staff-only sign-in.
- `/librarian` — protected librarian overview with live database counts.

The intended pilot is one physically checked section of 300–500 books. Do not enter all 60,000 register records as “available.”

## How Supabase works here

Supabase is a hosted PostgreSQL database plus authentication and file storage. The website does not store the library records itself:

```text
Visitor or librarian
        ↓ HTTPS
Next.js website / API routes
        ↓ publishable key + user's session
Supabase Auth → PostgreSQL → Row Level Security
                              ↓
                    only allowed rows/operations
```

1. **Database:** Titles, individual copies, shelves, members, loans, and register drafts live in PostgreSQL tables. Migrations in `backend/supabase/migrations` are the reproducible blueprint.
2. **Authentication:** Supabase Auth checks a librarian's email/password and gives the browser a short-lived signed session. The app validates that session server-side.
3. **Authorization:** Signing in is not enough. PostgreSQL checks `profiles` and `staff_roles` before allowing staff operations. A data-entry operator and an administrator therefore have different powers.
4. **Public search:** Anonymous visitors receive only fields exposed by `public_catalogue`. They see an aggregate such as “1 available copy,” never a borrower, loan record, or staff note.
5. **Availability:** A copy counts only when `verification_status = shelf_verified`. Its current circulation status must also be `available`.
6. **Safe circulation:** Issuing or returning uses PostgreSQL functions that lock the relevant rows. This prevents two librarians from issuing the same copy at the same time.
7. **Storage:** Cover images can later go into a Supabase Storage bucket. The database should store the file path and appropriate permission/source metadata. Storage is intentionally not enabled until CBT confirms image rights.
8. **Keys:** The publishable key is designed for the frontend and is constrained by RLS. A secret/service-role key bypasses RLS and must never be placed in browser code; this milestone does not require one.

## Local setup

Prerequisites: Node.js 22+, Docker Desktop (for local Supabase), and Git.

```sh
npm --prefix frontend install
npm --prefix backend install
cp frontend/.env.example frontend/.env.local
npm run backend:start
npm run backend:reset
```

After `backend:start`, copy the local API URL and publishable key into `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=the-publishable-key-printed-by-supabase
```

Then, from the repository root, run:

```sh
npm run dev
```

Open `http://localhost:3000`. Test the API with:

```sh
curl 'http://localhost:3000/api/catalogue?q=Mango&available=true'
```

## Creating the first librarian

Create a user in local Supabase Studio (`http://127.0.0.1:54323`) under Authentication. Copy the user’s UUID, then run the following in Studio’s SQL editor, replacing both placeholders:

```sql
insert into public.profiles (id, display_name)
values ('AUTH_USER_UUID', 'Local Admin');

insert into public.staff_roles (profile_id, role)
values ('AUTH_USER_UUID', 'admin');
```

This bootstrap is manual on purpose: public signup must not be able to make someone a librarian.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Database/RLS integration checks require Docker and a running local Supabase stack. Do not treat unit tests alone as proof that RLS works.

## Documentation

- [Architecture](docs/architecture.md)
- [Database schema](docs/database-schema.md)
- [API](docs/api.md)
- [Security](docs/security.md)
- [Digitization workflow](docs/digitization-workflow.md)
- [Deployment and backups](docs/deployment.md)

## Assumptions requiring CBT confirmation

- Membership types, loan periods, renewal limits, and reservation pickup periods are configurable and currently have fictional local values only.
- Accession numbers are staff-only by default.
- Cover images will be stored only where CBT has permission.
- The pilot starts with one agreed physical section and a shelf-code scheme chosen by librarians.
