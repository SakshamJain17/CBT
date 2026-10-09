import { catalogueSearchSchema } from "@/lib/validation/catalogue";
import { searchPublicCatalogue } from "@/lib/services/catalogue";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, handleApiError } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const input = catalogueSearchSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const supabase = await createSupabaseServerClient();
    return apiSuccess(await searchPublicCatalogue(supabase, input));
  } catch (error) {
    return handleApiError(error);
  }
}
