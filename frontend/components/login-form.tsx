"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const { error } = await createSupabaseBrowserClient().auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("Sign-in failed. Check your email and password.");
      setPending(false);
      return;
    }
    router.push("/librarian");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <div><label htmlFor="email">Staff email</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
      <div><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in with password"}</button>
    </form>
  );
}
