import type { Paginated } from "./types.ts";

export const LIST_PAGE_SIZE = 50;

export function listQuery(page: number) {
  return `page=${String(page)}&limit=${String(LIST_PAGE_SIZE)}`;
}

export function nextPagedPage(page: Paginated<unknown>) {
  return page.page < page.totalPages ? page.page + 1 : undefined;
}

export function nextListingPage(
  folders: Paginated<unknown>,
  files: Paginated<unknown>,
) {
  if (folders.page < folders.totalPages || files.page < files.totalPages) {
    return Math.max(folders.page, files.page) + 1;
  }
  return undefined;
}
