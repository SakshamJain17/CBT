import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";
import Link from "next/link";

export const metadata: Metadata = { title: "Librarian workspace" };

export default async function LibrarianPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  const { data: roles } = await supabase.rpc("current_staff_roles");
  if (!Array.isArray(roles) || roles.length === 0) redirect("/login?reason=staff");

  const [{ count: titles }, { count: copies }, { count: reviews }] = await Promise.all([
    supabase.from("bibliographic_records").select("id", { count: "exact", head: true }),
    supabase.from("physical_copies").select("id", { count: "exact", head: true }),
    supabase.from("draft_catalogue_records").select("id", { count: "exact", head: true }).in("status", ["entered", "needs_review"]),
  ]);

  return (
    <main className="workspace">
      <aside className="workspace-sidebar">
        <p className="workspace-brand">CBT<span>Library desk</span></p>
        <nav aria-label="Librarian workspace"><a className="active" href="#overview">Overview</a><a href="#catalogue">Catalogue</a><a href="#copies">Copies & shelves</a><a href="#digitisation">Digitisation</a><a href="#circulation">Circulation</a></nav>
        <SignOutButton />
      </aside>
      <section className="workspace-main" id="overview">
        <div className="workspace-topline"><span>Pilot workspace</span><span>{roles.includes("admin") ? <Link href="/admin">Administration →</Link> : null} {roles.join(" · ").replaceAll("_", " ")}</span></div>
        <h1>Good morning,<br /><em>librarian.</em></h1>
        <div className="metric-grid">
          <article><span>01</span><strong>{titles ?? 0}</strong><p>Catalogue titles</p></article>
          <article><span>02</span><strong>{copies ?? 0}</strong><p>Physical copies</p></article>
          <article><span>03</span><strong>{reviews ?? 0}</strong><p>Records to review</p></article>
        </div>
        <div className="pilot-card">
          <div><p className="eyebrow"><span>Next action</span> Pilot catalogue</p><h2>Begin with one shelf.</h2><p>Enter the register source, transcribe the title, then physically locate and verify each copy before publishing availability.</p></div>
          <ol><li>Create location and shelf</li><li>Enter register page</li><li>Add title and copy</li><li>Verify on shelf</li></ol>
        </div>
        <p className="workspace-note">Catalogue editing workflows are the next implementation milestone. This dashboard currently verifies authentication, roles, and live counts.</p>
      </section>
    </main>
  );
}
