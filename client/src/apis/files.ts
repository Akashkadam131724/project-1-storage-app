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

export function trashFile(fileId: string) {
  return apiRequest<PublicFile>(`/api/files/${fileId}`, { method: "DELETE" });
}

export function fileContentPath(fileId: string) {
  return `/api/files/${fileId}/content`;
}
