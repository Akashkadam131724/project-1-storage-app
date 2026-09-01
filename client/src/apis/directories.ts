import { apiRequest } from "./http.ts";
import type { FolderListing, PublicFolder } from "./types.ts";

const listQuery = "page=1&limit=100";

export function getFolder(folderId?: string) {
  const path = folderId
    ? `/api/directories/${folderId}?${listQuery}`
    : `/api/directories?${listQuery}`;
  return apiRequest<FolderListing>(path);
}

export function createFolder(name: string, parentId?: string) {
  return apiRequest<PublicFolder>("/api/directories", {
    method: "POST",
    body: JSON.stringify({ name, parentId }),
  });
}

export function trashFolder(folderId: string) {
  return apiRequest<PublicFolder>(`/api/directories/${folderId}`, {
    method: "DELETE",
  });
}
