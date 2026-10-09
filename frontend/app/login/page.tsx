import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Librarian sign in" };

export default function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-art" aria-hidden="true">
        <p>CATALOGUE · CIRCULATION · VERIFICATION</p>
        <div className="shelf-art">{Array.from({ length: 9 }, (_, index) => <span key={index} />)}</div>
        <h1>Every book.<br /><em>In its place.</em></h1>
      </section>
      <section className="login-panel">
        <Link className="back-link" href="/">← Return to public catalogue</Link>
        <p className="eyebrow"><span>Staff only</span> Secure access</p>
        <h2>Librarian sign in</h2>
        <p>Use the staff account created for you by a CBT administrator.</p>
        <LoginForm />
        <small>Accounts are managed centrally. Public registration is disabled.</small>
      </section>
    </main>
  );
}
