import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code");
  const forwardedHost = request.headers.get("x-forwarded-host"); const origin = forwardedHost ? `https://${forwardedHost}` : url.origin;
  if (!code) return NextResponse.redirect(`${origin}/login?error=oauth`);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/login?error=oauth`);
  const { data: roles } = await supabase.rpc("current_staff_roles");
  if (Array.isArray(roles) && roles.length > 0) return NextResponse.redirect(`${origin}/librarian`);
  await supabase.rpc("claim_member_account");
  return NextResponse.redirect(`${origin}/account`);
}
