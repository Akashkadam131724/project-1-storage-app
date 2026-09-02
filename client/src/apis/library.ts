import { apiRequest } from "./http.ts";
import { listQuery } from "./listing.ts";
import type { LibraryListing, Paginated, PublicFile } from "./types.ts";

export function getTrash(page = 1) {
  return apiRequest<LibraryListing>(`/api/trash?${listQuery(page)}`);
}

export function getStarred(page = 1) {
  return apiRequest<LibraryListing>(`/api/starred?${listQuery(page)}`);
}

export function getRecent(page = 1) {
  return apiRequest<Paginated<PublicFile>>(`/api/recent?${listQuery(page)}`);
}
