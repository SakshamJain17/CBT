import { z } from "zod";

export const catalogueSearchSchema = z.object({
  q: z.string().trim().max(200).default(""),
  language: z.string().trim().max(80).optional(),
  category: z.string().trim().max(100).optional(),
  available: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type CatalogueSearchInput = z.infer<typeof catalogueSearchSchema>;
