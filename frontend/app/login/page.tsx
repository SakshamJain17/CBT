import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export const metadata: Metadata = { title: "Sign in" };

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
        <p className="eyebrow"><span>Secure access</span> Members and staff</p>
        <h2>Sign in to CBT</h2>
        <p>Members see only their own loans. Staff are routed to the protected library workspace.</p>
        <GoogleSignInButton />
        <div className="login-divider"><span>Staff password access</span></div>
        <LoginForm />
        <small>Google sign-in does not grant administrative permission. Roles are assigned from CBT records.</small>
      </section>
    </main>
  );
}
