import { describe, expect, it } from "vitest";
import { catalogueSearchSchema } from "./catalogue";

describe("catalogueSearchSchema", () => {
  it("applies safe pagination defaults", () => {
    expect(catalogueSearchSchema.parse({})).toMatchObject({ page: 1, pageSize: 20 });
  });

  it("rejects oversized pages", () => {
    expect(() => catalogueSearchSchema.parse({ pageSize: 51 })).toThrow();
  });
});
