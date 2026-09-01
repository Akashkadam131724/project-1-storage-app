import { apiRequest } from "./http.ts";
import type { LibraryListing, Paginated, PublicFile } from "./types.ts";

const listQuery = "page=1&limit=100";

export function getTrash() {
  return apiRequest<LibraryListing>(`/api/trash?${listQuery}`);
}

export function getStarred() {
  return apiRequest<LibraryListing>(`/api/starred?${listQuery}`);
}

export function getRecent() {
  return apiRequest<Paginated<PublicFile>>(`/api/recent?${listQuery}`);
}
