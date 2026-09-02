import type { DriveItem, ListingEntry, Paginated } from "./types.ts";

export const LIST_PAGE_SIZE = 50;

export const SORT_BY = ["name", "modified", "opened"] as const;
export const SORT_DIR = ["asc", "desc"] as const;
export const FOLDER_PLACEMENT = ["top", "mixed"] as const;

export type SortBy = (typeof SORT_BY)[number];
export type SortDir = (typeof SORT_DIR)[number];
export type FolderPlacement = (typeof FOLDER_PLACEMENT)[number];

export type ListingSort = {
  sortBy: SortBy;
  sortDir: SortDir;
  folders: FolderPlacement;
};

export const DEFAULT_LISTING_SORT: ListingSort = {
  sortBy: "name",
  sortDir: "asc",
  folders: "top",
};

export function listQuery(
  page: number,
  sort: ListingSort = DEFAULT_LISTING_SORT,
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(LIST_PAGE_SIZE),
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
    folders: sort.folders,
  });
  return params.toString();
}

export function parseListingSort(value: unknown): ListingSort {
  if (!value || typeof value !== "object") return DEFAULT_LISTING_SORT;
  const record = value as Record<string, unknown>;
  return {
    sortBy: isSortBy(record.sortBy)
      ? record.sortBy
      : DEFAULT_LISTING_SORT.sortBy,
    sortDir: isSortDir(record.sortDir)
      ? record.sortDir
      : DEFAULT_LISTING_SORT.sortDir,
    folders: isFolderPlacement(record.folders)
      ? record.folders
      : DEFAULT_LISTING_SORT.folders,
  };
}

export function listingSortForField(
  current: ListingSort,
  sortBy: SortBy,
): ListingSort {
  if (current.sortBy === sortBy) return current;
  return {
    ...current,
    sortBy,
    sortDir: sortBy === "name" ? "asc" : "desc",
  };
}

export function toggleListingDir(current: ListingSort): ListingSort {
  return {
    ...current,
    sortDir: current.sortDir === "asc" ? "desc" : "asc",
  };
}

export function toDriveItems(entries: ListingEntry[]): DriveItem[] {
  return entries.map((entry) =>
    entry.type === "folder"
      ? { kind: "folder", folder: entry.folder }
      : { kind: "file", file: entry.file },
  );
}

export function nextPagedPage(page: Paginated<unknown>) {
  return page.page < page.totalPages ? page.page + 1 : undefined;
}

export function nextListingPage(
  folders: Paginated<unknown>,
  files: Paginated<unknown>,
  entries?: Paginated<unknown>,
) {
  if (entries) return nextPagedPage(entries);
  if (folders.page < folders.totalPages || files.page < files.totalPages) {
    return Math.max(folders.page, files.page) + 1;
  }
  return undefined;
}

function isSortBy(value: unknown): value is SortBy {
  return SORT_BY.includes(value as SortBy);
}

function isSortDir(value: unknown): value is SortDir {
  return SORT_DIR.includes(value as SortDir);
}

function isFolderPlacement(value: unknown): value is FolderPlacement {
  return FOLDER_PLACEMENT.includes(value as FolderPlacement);
}
