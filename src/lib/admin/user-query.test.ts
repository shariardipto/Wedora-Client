import { describe, expect, it } from "vitest";
import { parseAdminUserQuery, toAdminUserSearch } from "./user-query";

describe("admin user query", () => {
  it("keeps valid filters and drops invalid ones", () => {
    expect(parseAdminUserQuery({ q: " cara ", role: "vendor", status: "blocked", page: "2" })).toEqual({
      q: "cara",
      role: "vendor",
      status: "blocked",
      page: 2,
    });
    expect(parseAdminUserQuery({ role: "superuser", status: "banned", page: "-1" })).toEqual({
      q: undefined,
      role: undefined,
      status: undefined,
      page: 1,
    });
  });

  it("serializes without defaults", () => {
    expect(toAdminUserSearch({ page: 1 }).toString()).toBe("");
    expect(toAdminUserSearch({ q: "a@b.co", role: "customer", page: 3 }).toString()).toBe("q=a%40b.co&role=customer&page=3");
  });
});
