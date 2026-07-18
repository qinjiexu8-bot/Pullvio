import { describe, expect, it } from "vitest";
import { accountPageNumbers, resolveAccountPagination } from "./account-pagination";

describe("resolveAccountPagination", () => {
  it("uses safe defaults for invalid values", () => {
    expect(resolveAccountPagination({ page: "-2", pageSize: "500" })).toEqual({ page: 1, pageSize: 10 });
  });

  it("accepts the supported page sizes", () => {
    expect(resolveAccountPagination({ page: "3", pageSize: "50" })).toEqual({ page: 3, pageSize: 50 });
  });
});

describe("accountPageNumbers", () => {
  it("shows all short page ranges", () => {
    expect(accountPageNumbers(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("compresses long page ranges around the current page", () => {
    expect(accountPageNumbers(6, 12)).toEqual([1, "ellipsis", 5, 6, 7, "ellipsis", 12]);
  });
});
