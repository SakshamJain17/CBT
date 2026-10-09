-- Fictional development data only. This is not CBT catalogue or member data.
insert into public.languages (id, code, name) values
  ('10000000-0000-0000-0000-000000000001', 'en', 'English'),
  ('10000000-0000-0000-0000-000000000002', 'hi', 'Hindi');

insert into public.authors (id, display_name) values
  ('20000000-0000-0000-0000-000000000001', 'Example Author'),
  ('20000000-0000-0000-0000-000000000002', 'Sample Writer');

insert into public.categories (id, name) values
  ('30000000-0000-0000-0000-000000000001', 'Fiction'),
  ('30000000-0000-0000-0000-000000000002', 'Nature');

insert into public.library_locations (id, name) values
  ('40000000-0000-0000-0000-000000000001', 'Sample Pilot Room');
insert into public.shelves (id, location_id, code, description) values
  ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'SAMPLE-A1', 'Fictional shelf code for development');

insert into public.source_registers (id, label, description) values
  ('50000000-0000-0000-0000-000000000001', 'SAMPLE-REGISTER', 'Fictional register used only in local development');
insert into public.register_pages (id, register_id, page_number) values
  ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'SAMPLE-1');

insert into public.bibliographic_records (id, title, description, language_id, publication_year, status, keywords) values
  ('60000000-0000-0000-0000-000000000001', 'Sample: The Mango Tree Mystery', 'A fictional record for testing the pilot catalogue.', '10000000-0000-0000-0000-000000000001', 2024, 'published', array['mystery','trees']),
  ('60000000-0000-0000-0000-000000000002', 'नमूना: पहाड़ों की कहानियाँ', 'केवल स्थानीय परीक्षण के लिए एक काल्पनिक रिकॉर्ड।', '10000000-0000-0000-0000-000000000002', 2023, 'published', array['कहानी','पहाड़']);
insert into public.book_authors values
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1),
  ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 1);
insert into public.book_categories values
  ('60000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002');

insert into public.physical_copies (id, accession_number, barcode, bibliographic_record_id, shelf_id, source_register_id, source_page_id, source_row, verification_status, last_physically_verified_at) values
  ('70000000-0000-0000-0000-000000000001', 'SAMPLE-ACC-001', 'SAMPLE-BC-001', '60000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', '1', 'shelf_verified', now()),
  ('70000000-0000-0000-0000-000000000002', 'SAMPLE-ACC-002', null, '60000000-0000-0000-0000-000000000002', null, '50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', '2', 'register_only', null);

insert into public.membership_types (id, name, max_active_loans, loan_period_days, renewal_limit, renewal_period_days) values
  ('80000000-0000-0000-0000-000000000001', 'Sample standard member', 3, 14, 1, 7);
insert into public.members (id, membership_number, membership_type_id, full_name, status, membership_start, membership_expiry) values
  ('81000000-0000-0000-0000-000000000001', 'SAMPLE-MEMBER-001', '80000000-0000-0000-0000-000000000001', 'Fictional Test Member', 'active', current_date, current_date + 365);
