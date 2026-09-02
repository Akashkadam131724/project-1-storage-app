import { apiRequest } from "./http.ts";
import type { PublicFile } from "./types.ts";

export function uploadFile(file: File, parentId?: string) {
  const body = new FormData();
  body.append("file", file);
  if (parentId) {
    body.append("parentId", parentId);
  }
  return apiRequest<PublicFile>("/api/files", { method: "POST", body });
}

export function getFile(fileId: string) {
  return apiRequest<PublicFile>(`/api/files/${fileId}`);
}

export function renameFile(fileId: string, name: string) {
  return apiRequest<PublicFile>(`/api/files/${fileId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function trashFile(fileId: string) {
  return apiRequest<PublicFile>(`/api/files/${fileId}`, { method: "DELETE" });
}

export function restoreFile(fileId: string) {
  return apiRequest<PublicFile>(`/api/files/${fileId}/restore`, {
    method: "POST",
  });
}

export function moveFile(fileId: string, parentId: string) {
  return apiRequest<PublicFile>(`/api/files/${fileId}/move`, {
    method: "POST",
    body: JSON.stringify({ parentId }),
  });
}

export function copyFile(fileId: string, parentId?: string) {
  return apiRequest<PublicFile>(`/api/files/${fileId}/copy`, {
    method: "POST",
    body: JSON.stringify({ parentId }),
  });
}

export function setFileStar(fileId: string, starred: boolean) {
  const action = starred ? "star" : "unstar";
  return apiRequest<PublicFile>(`/api/files/${fileId}/${action}`, {
    method: "POST",
  });
}

export function purgeFile(fileId: string) {
  return apiRequest<undefined>(`/api/files/${fileId}/permanent`, {
    method: "DELETE",
  });
}

export function fileContentPath(fileId: string) {
  return `/api/files/${fileId}/content`;
}

export function fileDownloadPath(fileId: string) {
  return `${fileContentPath(fileId)}?download=1`;
}
