# Deployment and backups

For the pilot, host Next.js on a compatible free tier and use Supabase Free or a locally hosted Supabase stack. Free-tier limits can change; production still needs monitoring, tested backups, and a named operator.

Keep the app variables in the hosting provider's secret/environment settings. Do not commit `.env.local`.

Database export (replace placeholders locally):

```sh
pg_dump --format=custom --no-owner --file=cbt-library.dump "$DATABASE_URL"
```

Restore into an empty database:

```sh
pg_restore --no-owner --dbname="$DATABASE_URL" cbt-library.dump
```

The SQL migrations and standard PostgreSQL exports keep CBT's data portable and under CBT's ownership.
