import type { SupabaseClient } from "@supabase/supabase-js";
import type { CatalogueSearchInput } from "@/lib/validation/catalogue";

export type PublicCatalogueItem = {
  id: string;
  title: string;
  subtitle: string | null;
  authors: string[];
  language: string | null;
  categories: string[];
  publication_year: number | null;
  cover_url: string | null;
  availability: "available" | "unavailable" | "reference_only";
  available_copies: number;
  verified_copies: number;
};

export async function searchPublicCatalogue(
  supabase: SupabaseClient,
  input: CatalogueSearchInput,
) {
  const from = (input.page - 1) * input.pageSize;
  const to = from + input.pageSize - 1;
  let query = supabase
    .from("public_catalogue")
    .select("*", { count: "exact" })
    .order("title", { ascending: true })
    .range(from, to);

  if (input.q) query = query.textSearch("search_document", input.q, { type: "websearch" });
  if (input.language) query = query.eq("language", input.language);
  if (input.category) query = query.contains("categories", [input.category]);
  if (input.available === "true") query = query.gt("available_copies", 0);

  const { data, count, error } = await query;
  if (error) throw error;
  return {
    items: (data ?? []) as PublicCatalogueItem[],
    page: input.page,
    pageSize: input.pageSize,
    total: count ?? 0,
  };
}
