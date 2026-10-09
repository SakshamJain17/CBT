import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
export const metadata: Metadata = { title: "My library account" };
type LoanRow = { id:string; checked_out_at:string; current_due_at:string; returned_at:string|null; status:string; physical_copies:{accession_number:string; bibliographic_records:{title:string}|null}|null };

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient(); const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect("/login");
  await supabase.rpc("claim_member_account");
  const { data: member } = await supabase.from("members").select("id,full_name,membership_number,membership_expiry,status").eq("auth_user_id", claims.claims.sub).maybeSingle();
  if (!member) return <main className="account-page account-unlinked"><section><p className="eyebrow"><span>Account</span> Link required</p><h1>Your Google account is signed in.</h1><p>No CBT membership has been linked to this email. Ask a librarian to add this Google email to your membership record.</p><SignOutButton /></section></main>;
  const { data } = await supabase.from("loans").select("id,checked_out_at,current_due_at,returned_at,status,physical_copies(accession_number,bibliographic_records(title))").eq("member_id", member.id).order("checked_out_at", { ascending:false });
  const loans = (data ?? []) as unknown as LoanRow[];
  return <main className="account-page"><header className="account-header"><div><p className="eyebrow"><span>My CBT</span> Private account</p><h1>Hello, {member.full_name}.</h1></div><SignOutButton /></header><section className="account-summary"><div><span>Membership</span><strong>{member.membership_number}</strong></div><div><span>Status</span><strong>{member.status}</strong></div><div><span>Valid until</span><strong>{new Date(member.membership_expiry).toLocaleDateString("en-IN")}</strong></div></section><section className="loan-section"><p className="eyebrow"><span>Loans</span> Current and past records</p>{loans.length === 0 ? <p className="empty-state">No borrowing records are linked to this membership yet.</p> : <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Book</th><th>Accession</th><th>Borrowed</th><th>Due / returned</th><th>Status</th></tr></thead><tbody>{loans.map((loan)=><tr key={loan.id}><td>{loan.physical_copies?.bibliographic_records?.title ?? "Title unavailable"}</td><td>{loan.physical_copies?.accession_number ?? "—"}</td><td>{new Date(loan.checked_out_at).toLocaleDateString("en-IN")}</td><td>{new Date(loan.returned_at ?? loan.current_due_at).toLocaleDateString("en-IN")}</td><td>{loan.status}</td></tr>)}</tbody></table></div>}</section></main>;
}
