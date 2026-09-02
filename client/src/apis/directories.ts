import { apiRequest } from "./http.ts";
import { listQuery, type ListingSort } from "./listing.ts";
import type { FolderListing, PublicFolder } from "./types.ts";

export function getFolder(folderId?: string, page = 1, sort?: ListingSort) {
  const query = listQuery(page, sort);
  const path = folderId
    ? `/api/directories/${folderId}?${query}`
    : `/api/directories?${query}`;
  return apiRequest<FolderListing>(path);
}

export function createFolder(name: string, parentId?: string) {
  return apiRequest<PublicFolder>("/api/directories", {
    method: "POST",
    body: JSON.stringify({ name, parentId }),
  });
}

export function renameFolder(folderId: string, name: string) {
  return apiRequest<PublicFolder>(`/api/directories/${folderId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function trashFolder(folderId: string) {
  return apiRequest<PublicFolder>(`/api/directories/${folderId}`, {
    method: "DELETE",
  });
}

export function restoreFolder(folderId: string) {
  return apiRequest<PublicFolder>(`/api/directories/${folderId}/restore`, {
    method: "POST",
  });
}

export function moveFolder(folderId: string, parentId: string) {
  return apiRequest<PublicFolder>(`/api/directories/${folderId}/move`, {
    method: "POST",
    body: JSON.stringify({ parentId }),
  });
}

export function copyFolder(folderId: string, parentId?: string) {
  return apiRequest<PublicFolder>(`/api/directories/${folderId}/copy`, {
    method: "POST",
    body: JSON.stringify({ parentId }),
  });
}

export function setFolderStar(folderId: string, starred: boolean) {
  const action = starred ? "star" : "unstar";
  return apiRequest<PublicFolder>(`/api/directories/${folderId}/${action}`, {
    method: "POST",
  });
}

export function purgeFolder(folderId: string) {
  return apiRequest<undefined>(`/api/directories/${folderId}/permanent`, {
    method: "DELETE",
  });
}
