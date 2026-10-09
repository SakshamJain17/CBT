"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function signIn() {
    setPending(true); setMessage(null);
    const { error } = await createSupabaseBrowserClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
    if (error) { setMessage("Google sign-in could not be started."); setPending(false); }
  }
  return <div className="google-sign-in"><button type="button" onClick={signIn} disabled={pending}><span aria-hidden="true" className="google-mark">G</span>{pending ? "Opening Google…" : "Continue with Google"}</button>{message ? <p className="form-message" role="alert">{message}</p> : null}</div>;
}
