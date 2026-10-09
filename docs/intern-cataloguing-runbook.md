# Intern cataloguing runbook

This workflow is designed for handwritten registers and a collection of roughly 60,000 physical books. A register entry is evidence that a copy was recorded in the past; it is not evidence that the copy is currently on a shelf.

## Start with the pilot

Choose one bounded location containing approximately 300–500 books. Label its shelves before data entry begins. Complete transcription, review, physical verification, and a quality audit for this section before expanding to another section.

Do not give interns the Supabase owner password or a service-role key. Each intern should have an individual Supabase Auth account with the `data_entry_operator` role. Reviewers should have `librarian` or `senior_librarian`; only a small number of staff should be `admin`.

## Required evidence

Every entered copy must retain:

- source register label;
- register page number;
- row or line reference where possible;
- accession number exactly as written;
- name of the person who entered it;
- uncertainty notes for text that is unclear;
- review status; and
- physical-verification date and shelf, once found.

Never invent missing values. Leave them blank and add an uncertainty note.

## Lane A: manual entry

1. An administrator creates the source register, register pages, shelves, and a digitisation batch.
2. A data-entry operator transcribes one register row into a draft record.
3. The operator preserves the original spelling in the raw fields and flags uncertain fields.
4. A second person reviews the draft against the register image or physical register.
5. The system suggests possible duplicate titles by ISBN, normalized title, and author. A reviewer decides; records are never merged automatically.
6. The reviewer creates or links the title and creates the individual physical copy.
7. The copy remains `register_only` or `needs_review`.
8. A staff member finds the actual book, confirms its accession number, records its shelf and condition, and marks it `shelf_verified` with the current date.
9. A title is published only after review. Public availability counts only shelf-verified copies whose circulation status is `available`.

## Lane B: scan and OCR-assisted entry

1. Scan or photograph each register page clearly. Use one page per image, keep page edges visible, and use a stable filename such as `REG-01_page-0042.jpg`.
2. Store the original image. Never replace it with an OCR-cleaned image.
3. Run OCR or handwriting recognition to produce candidate text.
4. Import OCR output only into draft records. OCR must never create published titles or mark copies available.
5. An intern compares every OCR row with the page image and corrects it. Low-confidence fields are flagged for review.
6. A reviewer handles duplicates and converts accepted drafts into title and copy records.
7. Physical shelf verification is still mandatory.

For a small batch, use the two CSV templates in `docs/templates`. For large batches, import into a staging table or use a controlled import script; do not import directly into final title and copy tables.

## Batch sizing and quality control

- Assign batches of 25–50 register rows so errors are caught early.
- Use two-person review for the first 300–500 books.
- Recheck a random 10% sample after review.
- Stop a batch if the sampled error rate exceeds 2%; correct it before continuing.
- Keep one person from both entering and approving the same record where staffing permits.
- Track throughput, review backlog, duplicate rate, not-found rate, and sampled error rate—not just rows entered.

## Definition of done for one copy

A copy is complete when its title is reviewed, accession number is unique, register/page provenance is stored, physical book has been found, shelf is recorded, verification has a staff member and timestamp, and its circulation status reflects reality.

## CSV rules

- Save files as UTF-8 CSV so Indian-language text is preserved.
- Do not change column headings.
- One row represents one physical copy, not one title.
- Repeat title metadata when multiple copies of the same title appear; the review process will link them to one title without automatically merging uncertain matches.
- Keep ISBN as text so leading zeroes are not removed.
- Use ISO dates: `YYYY-MM-DD`.
- Use only real CBT identifiers. The template rows are deliberately labelled examples and must be removed before import.
