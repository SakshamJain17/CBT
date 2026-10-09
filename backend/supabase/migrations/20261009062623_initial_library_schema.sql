create extension if not exists pg_trgm with schema extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

create type public.staff_role as enum ('admin', 'senior_librarian', 'librarian', 'data_entry_operator', 'read_only_staff');
create type public.catalogue_status as enum ('draft', 'review', 'published', 'archived');
create type public.copy_status as enum ('available', 'on_loan', 'reserved', 'lost', 'missing', 'damaged', 'under_repair', 'reference_only', 'withdrawn');
create type public.verification_status as enum ('register_only', 'needs_review', 'shelf_verified', 'missing_during_verification');
create type public.member_status as enum ('active', 'blocked', 'expired', 'inactive');
create type public.loan_status as enum ('active', 'returned', 'overdue', 'lost');
create type public.reservation_status as enum ('pending', 'ready_for_pickup', 'fulfilled', 'cancelled', 'expired');
create type public.draft_status as enum ('entered', 'needs_review', 'validated', 'converted', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (length(trim(display_name)) > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.staff_role not null,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references public.profiles(id) on delete restrict,
  primary key (profile_id, role)
);

create table public.languages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique
);

create table public.publishers (
  id uuid primary key default gen_random_uuid(),
  name text not null
);
create unique index publishers_normalized_name_idx on public.publishers (lower(regexp_replace(trim(name), '\s+', ' ', 'g')));

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  created_at timestamptz not null default now()
);
create index authors_name_trgm_idx on public.authors using gin (display_name extensions.gin_trgm_ops);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  parent_id uuid references public.categories(id) on delete restrict
);

create table public.bibliographic_records (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  subtitle text,
  statement_of_responsibility text,
  edition text,
  description text,
  isbn_10 text,
  isbn_13 text,
  publication_year integer check (publication_year between 1000 and 2200),
  publisher_id uuid references public.publishers(id) on delete set null,
  language_id uuid references public.languages(id) on delete restrict,
  page_count integer check (page_count > 0),
  minimum_age integer check (minimum_age between 0 and 120),
  maximum_age integer check (maximum_age between 0 and 120),
  reading_level text,
  classification_number text,
  keywords text[] not null default '{}',
  cover_path text,
  status public.catalogue_status not null default 'draft',
  search_document tsvector not null default ''::tsvector,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (minimum_age is null or maximum_age is null or minimum_age <= maximum_age)
);
create unique index bibliographic_isbn10_idx on public.bibliographic_records (regexp_replace(isbn_10, '[^0-9Xx]', '', 'g')) where isbn_10 is not null;
create unique index bibliographic_isbn13_idx on public.bibliographic_records (regexp_replace(isbn_13, '[^0-9]', '', 'g')) where isbn_13 is not null;
create index bibliographic_search_idx on public.bibliographic_records using gin (search_document);
create index bibliographic_title_trgm_idx on public.bibliographic_records using gin (title extensions.gin_trgm_ops);

create or replace function public.update_bibliographic_search_document()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.search_document :=
    setweight(to_tsvector('simple', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(new.subtitle, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('simple', array_to_string(new.keywords, ' ')), 'B');
  return new;
end;
$$;
revoke all on function public.update_bibliographic_search_document() from public;
create trigger bibliographic_search_document_update
before insert or update of title, subtitle, description, keywords on public.bibliographic_records
for each row execute function public.update_bibliographic_search_document();

create table public.book_authors (
  bibliographic_record_id uuid not null references public.bibliographic_records(id) on delete cascade,
  author_id uuid not null references public.authors(id) on delete restrict,
  position smallint not null default 1 check (position > 0),
  primary key (bibliographic_record_id, author_id)
);

create table public.book_categories (
  bibliographic_record_id uuid not null references public.bibliographic_records(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  primary key (bibliographic_record_id, category_id)
);

create table public.library_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true
);

create table public.shelves (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.library_locations(id) on delete restrict,
  code text not null,
  description text,
  active boolean not null default true,
  unique (location_id, code)
);

create table public.source_registers (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  description text,
  first_page integer,
  last_page integer,
  created_at timestamptz not null default now()
);

create table public.register_pages (
  id uuid primary key default gen_random_uuid(),
  register_id uuid not null references public.source_registers(id) on delete restrict,
  page_number text not null,
  image_path text,
  notes text,
  unique (register_id, page_number)
);

create table public.physical_copies (
  id uuid primary key default gen_random_uuid(),
  accession_number text not null unique,
  barcode text unique,
  bibliographic_record_id uuid not null references public.bibliographic_records(id) on delete restrict,
  shelf_id uuid references public.shelves(id) on delete restrict,
  source_register_id uuid references public.source_registers(id) on delete restrict,
  source_page_id uuid references public.register_pages(id) on delete restrict,
  source_row text,
  acquisition_date date,
  acquisition_source text,
  price numeric(12,2) check (price >= 0),
  condition_note text,
  circulation_status public.copy_status not null default 'available',
  verification_status public.verification_status not null default 'register_only',
  last_physically_verified_at timestamptz,
  staff_notes text,
  created_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (verification_status <> 'shelf_verified' or last_physically_verified_at is not null)
);
create index physical_copies_record_idx on public.physical_copies (bibliographic_record_id);
create index physical_copies_shelf_idx on public.physical_copies (shelf_id);

create table public.membership_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  max_active_loans integer not null check (max_active_loans >= 0),
  loan_period_days integer not null check (loan_period_days > 0),
  renewal_limit integer not null default 0 check (renewal_limit >= 0),
  renewal_period_days integer not null check (renewal_period_days > 0),
  active boolean not null default true
);

create table public.members (
  id uuid primary key default gen_random_uuid(),
  membership_number text not null unique,
  membership_type_id uuid not null references public.membership_types(id) on delete restrict,
  full_name text not null,
  date_of_birth date,
  email text,
  phone text,
  guardian_name text,
  guardian_contact text,
  status public.member_status not null default 'active',
  membership_start date not null,
  membership_expiry date not null,
  private_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (membership_expiry >= membership_start)
);

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  physical_copy_id uuid not null references public.physical_copies(id) on delete restrict,
  member_id uuid not null references public.members(id) on delete restrict,
  issued_by uuid not null references public.profiles(id) on delete restrict,
  checked_out_at timestamptz not null default now(),
  original_due_at timestamptz not null,
  current_due_at timestamptz not null,
  returned_at timestamptz,
  returned_to uuid references public.profiles(id) on delete restrict,
  renewal_count integer not null default 0 check (renewal_count >= 0),
  status public.loan_status not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  check ((status = 'returned') = (returned_at is not null))
);
create unique index one_active_loan_per_copy_idx on public.loans (physical_copy_id) where status in ('active', 'overdue');
create index loans_member_active_idx on public.loans (member_id, status);
create index loans_due_idx on public.loans (current_due_at) where status in ('active', 'overdue');

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  bibliographic_record_id uuid not null references public.bibliographic_records(id) on delete restrict,
  member_id uuid not null references public.members(id) on delete restrict,
  status public.reservation_status not null default 'pending',
  requested_at timestamptz not null default now(),
  ready_at timestamptz,
  expires_at timestamptz,
  fulfilled_copy_id uuid references public.physical_copies(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict
);
create index reservation_queue_idx on public.reservations (bibliographic_record_id, requested_at) where status = 'pending';

create table public.digitization_batches (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  register_id uuid not null references public.source_registers(id) on delete restrict,
  assigned_to uuid references public.profiles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.draft_catalogue_records (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.digitization_batches(id) on delete restrict,
  register_page_id uuid not null references public.register_pages(id) on delete restrict,
  row_sequence text,
  raw_title text not null,
  raw_author text,
  raw_accession_number text,
  raw_data jsonb not null default '{}',
  uncertainty_notes text,
  status public.draft_status not null default 'entered',
  entered_by uuid not null references public.profiles(id) on delete restrict,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  converted_record_id uuid references public.bibliographic_records(id) on delete restrict,
  converted_copy_id uuid references public.physical_copies(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.record_review_flags (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.draft_catalogue_records(id) on delete cascade,
  field_name text not null,
  reason text not null,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete restrict
);

create table public.duplicate_candidates (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null references public.draft_catalogue_records(id) on delete cascade,
  candidate_record_id uuid not null references public.bibliographic_records(id) on delete cascade,
  score numeric(5,4) check (score between 0 and 1),
  reasons jsonb not null default '{}',
  resolved_as text check (resolved_as in ('same_title', 'different_title')),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete restrict,
  unique (draft_id, candidate_record_id)
);

create table public.verification_tasks (
  id uuid primary key default gen_random_uuid(),
  physical_copy_id uuid not null references public.physical_copies(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete restrict,
  status text not null default 'open' check (status in ('open', 'verified', 'not_found', 'cancelled')),
  due_at timestamptz,
  completed_at timestamptz,
  notes text
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  changes jsonb not null default '{}',
  occurred_at timestamptz not null default now()
);

create table public.library_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default now()
);

create or replace function private.has_role(required_roles public.staff_role[])
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.profiles p
    join public.staff_roles sr on sr.profile_id = p.id
    where p.id = (select auth.uid()) and p.active and sr.role = any(required_roles)
  );
$$;
revoke all on function private.has_role(public.staff_role[]) from public;
grant usage on schema private to authenticated;
grant execute on function private.has_role(public.staff_role[]) to authenticated;

create or replace function public.current_staff_roles()
returns public.staff_role[]
language sql
security invoker
stable
set search_path = ''
as $$
  select coalesce(array_agg(sr.role), '{}'::public.staff_role[])
  from public.staff_roles sr
  join public.profiles p on p.id = sr.profile_id
  where sr.profile_id = (select auth.uid()) and p.active;
$$;
revoke all on function public.current_staff_roles() from public;
grant execute on function public.current_staff_roles() to authenticated;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function public.set_updated_at() from public;

create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger records_updated before update on public.bibliographic_records for each row execute function public.set_updated_at();
create trigger copies_updated before update on public.physical_copies for each row execute function public.set_updated_at();
create trigger members_updated before update on public.members for each row execute function public.set_updated_at();
create trigger drafts_updated before update on public.draft_catalogue_records for each row execute function public.set_updated_at();

create or replace function public.issue_copy(copy_id uuid, borrower_id uuid, note text default null)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare copy_row public.physical_copies; member_row public.members; rule_row public.membership_types; active_count integer; new_loan_id uuid;
begin
  if not private.has_role(array['admin','senior_librarian','librarian']::public.staff_role[]) then raise exception 'insufficient_permission'; end if;
  select * into copy_row from public.physical_copies where id = copy_id for update;
  if not found or copy_row.circulation_status <> 'available' or copy_row.verification_status <> 'shelf_verified' then raise exception 'copy_not_eligible'; end if;
  select * into member_row from public.members where id = borrower_id for update;
  if not found or member_row.status <> 'active' or member_row.membership_expiry < current_date then raise exception 'member_not_eligible'; end if;
  select * into rule_row from public.membership_types where id = member_row.membership_type_id and active;
  select count(*) into active_count from public.loans where member_id = borrower_id and status in ('active','overdue');
  if active_count >= rule_row.max_active_loans then raise exception 'borrowing_limit_reached'; end if;
  insert into public.loans (physical_copy_id, member_id, issued_by, original_due_at, current_due_at, notes)
  values (copy_id, borrower_id, (select auth.uid()), now() + make_interval(days => rule_row.loan_period_days), now() + make_interval(days => rule_row.loan_period_days), note)
  returning id into new_loan_id;
  update public.physical_copies set circulation_status = 'on_loan' where id = copy_id;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, changes) values ((select auth.uid()), 'loan.issued', 'loan', new_loan_id, jsonb_build_object('copy_id', copy_id));
  return new_loan_id;
end;
$$;

create or replace function public.return_copy(loan_id uuid, note text default null)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare loan_row public.loans; waiting boolean;
begin
  if not private.has_role(array['admin','senior_librarian','librarian']::public.staff_role[]) then raise exception 'insufficient_permission'; end if;
  select * into loan_row from public.loans where id = loan_id and status in ('active','overdue') for update;
  if not found then raise exception 'active_loan_not_found'; end if;
  select exists(select 1 from public.reservations r join public.physical_copies c on c.bibliographic_record_id = r.bibliographic_record_id where c.id = loan_row.physical_copy_id and r.status = 'pending') into waiting;
  update public.loans set status = 'returned', returned_at = now(), returned_to = (select auth.uid()), notes = coalesce(note, notes) where id = loan_id;
  update public.physical_copies set circulation_status = case when waiting then 'reserved'::public.copy_status else 'available'::public.copy_status end where id = loan_row.physical_copy_id;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, changes) values ((select auth.uid()), 'loan.returned', 'loan', loan_id, jsonb_build_object('reservation_waiting', waiting));
end;
$$;
revoke all on function public.issue_copy(uuid, uuid, text) from public;
revoke all on function public.return_copy(uuid, text) from public;
grant execute on function public.issue_copy(uuid, uuid, text), public.return_copy(uuid, text) to authenticated;

create view public.public_catalogue with (security_invoker = true) as
select b.id, b.title, b.subtitle, l.name as language, b.publication_year, b.cover_path as cover_url,
  coalesce(array_agg(distinct a.display_name) filter (where a.id is not null), '{}') as authors,
  coalesce(array_agg(distinct c.name) filter (where c.id is not null), '{}') as categories,
  count(distinct pc.id) as verified_copies,
  count(distinct pc.id) filter (where pc.circulation_status = 'available') as available_copies,
  case
    when count(distinct pc.id) filter (where pc.circulation_status = 'available') > 0 then 'available'
    when count(distinct pc.id) filter (where pc.circulation_status = 'reference_only') > 0 then 'reference_only'
    else 'unavailable'
  end as availability,
  b.search_document
from public.bibliographic_records b
left join public.languages l on l.id = b.language_id
left join public.book_authors ba on ba.bibliographic_record_id = b.id
left join public.authors a on a.id = ba.author_id
left join public.book_categories bc on bc.bibliographic_record_id = b.id
left join public.categories c on c.id = bc.category_id
left join public.physical_copies pc on pc.bibliographic_record_id = b.id and pc.verification_status = 'shelf_verified' and pc.circulation_status <> 'withdrawn'
where b.status = 'published'
group by b.id, l.name;

do $$ declare table_name text; begin
  foreach table_name in array array['profiles','staff_roles','languages','publishers','authors','categories','bibliographic_records','book_authors','book_categories','library_locations','shelves','source_registers','register_pages','physical_copies','membership_types','members','loans','reservations','digitization_batches','draft_catalogue_records','record_review_flags','duplicate_candidates','verification_tasks','audit_logs','library_settings']
  loop execute format('alter table public.%I enable row level security', table_name); end loop;
end $$;

create policy staff_read_profiles on public.profiles for select to authenticated using (private.has_role(array['admin','senior_librarian','librarian','data_entry_operator','read_only_staff']::public.staff_role[]));
create policy admins_manage_profiles on public.profiles for all to authenticated using (private.has_role(array['admin']::public.staff_role[])) with check (private.has_role(array['admin']::public.staff_role[]));
create policy staff_read_roles on public.staff_roles for select to authenticated using (profile_id = (select auth.uid()) or private.has_role(array['admin']::public.staff_role[]));
create policy admins_manage_roles on public.staff_roles for all to authenticated using (private.has_role(array['admin']::public.staff_role[])) with check (private.has_role(array['admin']::public.staff_role[]));

do $$ declare table_name text; begin
  foreach table_name in array array['languages','publishers','authors','categories','bibliographic_records','book_authors','book_categories','library_locations','shelves','source_registers','register_pages','physical_copies','membership_types','members','loans','reservations','digitization_batches','draft_catalogue_records','record_review_flags','duplicate_candidates','verification_tasks','audit_logs','library_settings']
  loop execute format('create policy staff_select on public.%I for select to authenticated using (private.has_role(array[''admin'',''senior_librarian'',''librarian'',''data_entry_operator'',''read_only_staff'']::public.staff_role[]))', table_name); end loop;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['languages','publishers','authors','categories','bibliographic_records','book_authors','book_categories','library_locations','shelves','source_registers','register_pages','physical_copies','digitization_batches','draft_catalogue_records','record_review_flags','duplicate_candidates','verification_tasks']
  loop execute format('create policy catalogue_write on public.%I for all to authenticated using (private.has_role(array[''admin'',''senior_librarian'',''librarian'',''data_entry_operator'']::public.staff_role[])) with check (private.has_role(array[''admin'',''senior_librarian'',''librarian'',''data_entry_operator'']::public.staff_role[]))', table_name); end loop;
end $$;

do $$ declare table_name text; begin
  foreach table_name in array array['membership_types','members','loans','reservations']
  loop execute format('create policy circulation_write on public.%I for all to authenticated using (private.has_role(array[''admin'',''senior_librarian'',''librarian'']::public.staff_role[])) with check (private.has_role(array[''admin'',''senior_librarian'',''librarian'']::public.staff_role[]))', table_name); end loop;
end $$;
create policy admins_manage_settings on public.library_settings for all to authenticated using (private.has_role(array['admin']::public.staff_role[])) with check (private.has_role(array['admin']::public.staff_role[]));
create policy system_insert_audit on public.audit_logs for insert to authenticated with check (actor_id = (select auth.uid()));

create policy public_published_records on public.bibliographic_records for select to anon, authenticated using (status = 'published');
create policy public_verified_copies on public.physical_copies for select to anon, authenticated using (verification_status = 'shelf_verified' and circulation_status <> 'withdrawn');
create policy public_lookup_languages on public.languages for select to anon, authenticated using (true);
create policy public_lookup_authors on public.authors for select to anon, authenticated using (true);
create policy public_lookup_categories on public.categories for select to anon, authenticated using (true);
create policy public_lookup_book_authors on public.book_authors for select to anon, authenticated using (true);
create policy public_lookup_book_categories on public.book_categories for select to anon, authenticated using (true);

revoke all on all tables in schema public from anon, authenticated;
grant select (id, title, subtitle, publication_year, cover_path, language_id, status, search_document) on public.bibliographic_records to anon, authenticated;
grant select (id, bibliographic_record_id, circulation_status, verification_status) on public.physical_copies to anon, authenticated;
grant select (id, name) on public.languages, public.categories to anon, authenticated;
grant select (id, display_name) on public.authors to anon, authenticated;
grant select on public.book_authors, public.book_categories to anon, authenticated;
grant select on public.public_catalogue to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
