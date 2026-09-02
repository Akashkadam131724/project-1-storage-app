import { z } from "zod";
import {
  paginationQuerySchema,
  type PaginationQuery,
} from "../pagination/index.js";

export const SORT_BY = ["name", "modified", "opened"] as const;
export const SORT_DIR = ["asc", "desc"] as const;
export const FOLDER_PLACEMENT = ["top", "mixed"] as const;
export const LISTING_CONTEXTS = [
  "children",
  "trash",
  "starred",
  "recent",
] as const;

export type SortBy = (typeof SORT_BY)[number];
export type SortDir = (typeof SORT_DIR)[number];
export type FolderPlacement = (typeof FOLDER_PLACEMENT)[number];
export type ListingContext = (typeof LISTING_CONTEXTS)[number];

export type ListingQuery = PaginationQuery & {
  sortBy?: SortBy;
  sortDir: SortDir;
  folders: FolderPlacement;
};

export const listingQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(SORT_BY).optional(),
  sortDir: z.enum(SORT_DIR).optional(),
  folders: z.enum(FOLDER_PLACEMENT).optional(),
});

const CONTEXT_DIR: Record<ListingContext, SortDir> = {
  children: "asc",
  trash: "desc",
  starred: "desc",
  recent: "desc",
};

export function listingQueryOf(
  query: unknown,
  context: ListingContext,
): ListingQuery {
  const parsed = listingQuerySchema.parse(query);
  return {
    page: parsed.page,
    limit: parsed.limit,
    sortBy: parsed.sortBy,
    sortDir: parsed.sortDir ?? defaultSortDir(parsed.sortBy, context),
    folders: parsed.folders ?? "top",
  };
}

function defaultSortDir(
  sortBy: SortBy | undefined,
  context: ListingContext,
): SortDir {
  if (sortBy === "name") return "asc";
  if (sortBy === "modified" || sortBy === "opened") return "desc";
  return CONTEXT_DIR[context];
}
