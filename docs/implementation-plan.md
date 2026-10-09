# Incremental implementation plan

## Milestone 1 — backend foundation and verified pilot

Schema, staff authorization, public-safe catalogue view, core APIs, fictional seed data, and local setup. Validate with 300–500 physically verified books from one section.

## Milestone 2 — catalogue operations

Add protected CRUD routes/services, duplicate suggestions, staff login test page, public title detail/browse endpoints, and cover storage after rights policy is confirmed.

## Milestone 3 — circulation

Expose issue/return/renew/reservation APIs around transaction-safe database functions. Add real PostgreSQL integration tests for concurrency, limits, blocked members, renewals, and reservation queues.

## Milestone 4 — digitization and inventory

Build register-page entry/review APIs, CSV dry-run/validation, duplicate review, shelf-verification work queues, and pilot progress reporting.

## Milestone 5 — operations

Reports, privacy-aware exports, backup drills, accessibility review, production monitoring, librarian training, and staged deployment linked from CBT’s current site.
