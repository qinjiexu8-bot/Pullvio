export const ACCOUNT_PAGE_SIZES = [10, 20, 50] as const;
export type AccountPageSize = (typeof ACCOUNT_PAGE_SIZES)[number];
export type AccountSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function resolveAccountPagination(searchParams: AccountSearchParams) {
  const requestedPage = Number.parseInt(firstValue(searchParams.page) ?? "1", 10);
  const requestedSize = Number.parseInt(firstValue(searchParams.pageSize) ?? "10", 10);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const pageSize = ACCOUNT_PAGE_SIZES.includes(requestedSize as AccountPageSize)
    ? requestedSize as AccountPageSize
    : 10;
  return { page, pageSize };
}

export function accountPageNumbers(page: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const candidates = new Set([1, totalPages, page - 1, page, page + 1]);
  const pages = [...candidates].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  pages.forEach((value, index) => {
    if (index > 0 && value - pages[index - 1] > 1) result.push("ellipsis");
    result.push(value);
  });
  return result;
}
