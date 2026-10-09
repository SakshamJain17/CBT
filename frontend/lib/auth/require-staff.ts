import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireStaff(allowedRoles?: string[]) {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return { ok: false as const, status: 401, message: "Authentication required." };
  }

  const { data: roles, error } = await supabase.rpc("current_staff_roles");
  if (error || !Array.isArray(roles) || roles.length === 0) {
    return { ok: false as const, status: 403, message: "A staff account is required." };
  }
  if (allowedRoles && !roles.some((role) => allowedRoles.includes(String(role)))) {
    return { ok: false as const, status: 403, message: "You do not have permission." };
  }
  return { ok: true as const, supabase, userId: claimsData.claims.sub, roles };
}
