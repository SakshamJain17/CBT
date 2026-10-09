import { requireStaff } from "@/lib/auth/require-staff";
import { apiError, apiSuccess, handleApiError } from "@/lib/http";

export async function GET() {
  try {
    const auth = await requireStaff();
    if (!auth.ok) return apiError("FORBIDDEN", auth.message, auth.status);
    return apiSuccess({ userId: auth.userId, roles: auth.roles });
  } catch (error) {
    return handleApiError(error);
  }
}
