"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/auth/require-staff";

const optionalText = z.string().trim().max(500).optional();
const optionalUuid = z.union([z.uuid(), z.literal("")]).optional();

function refreshDashboard() {
  revalidatePath("/admin");
  revalidatePath("/librarian");
  revalidatePath("/");
}

async function requireAdmin() {
  const auth = await requireStaff(["admin"]);
  if (!auth.ok) throw new Error(auth.message);
  return auth;
}

export async function addTitle(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({
    title: z.string().trim().min(1).max(500),
    subtitle: optionalText,
    isbn13: z.union([z.string().regex(/^\d{13}$/), z.literal("")]).optional(),
    publicationYear: z.union([z.coerce.number().int().min(1000).max(2200), z.literal("")]).optional(),
    status: z.enum(["draft", "review", "published"]),
  }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.from("bibliographic_records").insert({ title: input.title, subtitle: input.subtitle || null, isbn_13: input.isbn13 || null, publication_year: input.publicationYear || null, status: input.status, created_by: auth.userId });
  if (error) throw error;
  refreshDashboard();
}

export async function updateTitleStatus(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ id: z.uuid(), status: z.enum(["draft", "review", "published", "archived"]) }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.from("bibliographic_records").update({ status: input.status }).eq("id", input.id);
  if (error) throw error;
  refreshDashboard();
}

export async function addCopy(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ bibliographicRecordId: z.uuid(), accessionNumber: z.string().trim().min(1).max(100), barcode: z.string().trim().max(100).optional(), shelfId: optionalUuid, circulationStatus: z.enum(["available", "reference_only", "under_repair", "missing"]), verificationStatus: z.enum(["register_only", "needs_review", "shelf_verified", "missing_during_verification"]) }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.from("physical_copies").insert({ bibliographic_record_id: input.bibliographicRecordId, accession_number: input.accessionNumber, barcode: input.barcode || null, shelf_id: input.shelfId || null, circulation_status: input.circulationStatus, verification_status: input.verificationStatus, last_physically_verified_at: input.verificationStatus === "shelf_verified" ? new Date().toISOString() : null, created_by: auth.userId });
  if (error) throw error;
  refreshDashboard();
}

export async function updateCopyStatus(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ id: z.uuid(), circulationStatus: z.enum(["available", "on_loan", "reserved", "lost", "missing", "damaged", "under_repair", "reference_only", "withdrawn"]) }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.from("physical_copies").update({ circulation_status: input.circulationStatus }).eq("id", input.id);
  if (error) throw error;
  refreshDashboard();
}

export async function addMembershipType(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ name: z.string().trim().min(1).max(100), maxActiveLoans: z.coerce.number().int().min(0).max(100), loanPeriodDays: z.coerce.number().int().min(1).max(365), renewalLimit: z.coerce.number().int().min(0).max(20) }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.from("membership_types").insert({ name: input.name, max_active_loans: input.maxActiveLoans, loan_period_days: input.loanPeriodDays, renewal_limit: input.renewalLimit, renewal_period_days: input.loanPeriodDays });
  if (error) throw error;
  refreshDashboard();
}

export async function addMember(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ membershipNumber: z.string().trim().min(1).max(100), fullName: z.string().trim().min(1).max(300), email: z.union([z.email(), z.literal("")]), phone: z.string().trim().max(30).optional(), membershipStart: z.iso.date(), membershipExpiry: z.iso.date(), membershipTypeId: z.uuid() }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.from("members").insert({ membership_number: input.membershipNumber, full_name: input.fullName, email: input.email || null, phone: input.phone || null, membership_start: input.membershipStart, membership_expiry: input.membershipExpiry, membership_type_id: input.membershipTypeId });
  if (error) throw error;
  refreshDashboard();
}

export async function updateMemberStatus(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ id: z.uuid(), status: z.enum(["active", "blocked", "expired", "inactive"]) }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.from("members").update({ status: input.status }).eq("id", input.id);
  if (error) throw error;
  refreshDashboard();
}

export async function issueLoan(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ copyId: z.uuid(), memberId: z.uuid(), note: optionalText }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.rpc("issue_copy", { copy_id: input.copyId, borrower_id: input.memberId, note: input.note || null });
  if (error) throw error;
  refreshDashboard();
}

export async function returnLoan(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ loanId: z.uuid() }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.rpc("return_copy", { loan_id: input.loanId, note: null });
  if (error) throw error;
  refreshDashboard();
}

export async function assignStaffRole(formData: FormData) {
  const auth = await requireAdmin();
  const input = z.object({ email: z.email(), displayName: z.string().trim().min(1).max(200), role: z.enum(["admin", "senior_librarian", "librarian", "data_entry_operator", "read_only_staff"]) }).parse(Object.fromEntries(formData));
  const { error } = await auth.supabase.rpc("admin_assign_staff_by_email", { staff_email: input.email, staff_display_name: input.displayName, staff_role: input.role });
  if (error) throw error;
  refreshDashboard();
}
