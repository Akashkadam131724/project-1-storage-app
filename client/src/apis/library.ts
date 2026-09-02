import { apiRequest } from "./http.ts";
import { listQuery, type ListingSort } from "./listing.ts";
import type { LibraryListing, Paginated, PublicFile } from "./types.ts";

export function getTrash(page = 1, sort?: ListingSort) {
  return apiRequest<LibraryListing>(`/api/trash?${listQuery(page, sort)}`);
}

export function getStarred(page = 1, sort?: ListingSort) {
  return apiRequest<LibraryListing>(`/api/starred?${listQuery(page, sort)}`);
}

export function getRecent(page = 1, sort?: ListingSort) {
  return apiRequest<Paginated<PublicFile>>(
    `/api/recent?${listQuery(page, sort)}`,
  );
}
