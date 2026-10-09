# Database schema

Bibliographic records describe titles. `physical_copies` represents individual books and links each copy to a shelf, source register/page, circulation status, and physical-verification status.

The schema also contains staff profiles and roles, members and membership rules, loans and reservations, register digitization batches/drafts/review flags, duplicate candidates, verification tasks, settings, and audit logs.

Critical rules are enforced in PostgreSQL: unique accession numbers and non-null barcodes, one active loan per copy, valid date/age ranges, and verified copies requiring a verification timestamp.

`public_catalogue` contains only public-safe aggregated fields. Availability counts only `shelf_verified` copies. A register-only copy never makes a title publicly available.
