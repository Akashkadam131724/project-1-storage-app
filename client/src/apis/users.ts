import { apiRequest } from "./http.ts";
import type { AdminUser, Paginated, PublicUser, UserRole } from "./types.ts";

export function getMe() {
  return apiRequest<PublicUser>("/api/users/me");
}

export function updateProfile(name: string) {
  return apiRequest<PublicUser>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<undefined>("/api/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export function setPassword(password: string) {
  return apiRequest<undefined>("/api/users/me/password", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function disableMe() {
  return apiRequest<undefined>("/api/users/me/disable", { method: "PATCH" });
}

export function deleteMe() {
  return apiRequest<undefined>("/api/users/me", { method: "DELETE" });
}

export function listUsers(page = 1, limit = 50) {
  return apiRequest<Paginated<AdminUser>>(
    `/api/users?page=${String(page)}&limit=${String(limit)}`,
  );
}

export function adminLogoutUser(userId: string) {
  return apiRequest<undefined>(`/api/users/${userId}/logout`, {
    method: "POST",
  });
}

export function adminDisableUser(userId: string) {
  return apiRequest<undefined>(`/api/users/${userId}/disable`, {
    method: "PATCH",
  });
}

export function adminRestoreUser(userId: string) {
  return apiRequest<undefined>(`/api/users/${userId}/restore`, {
    method: "PATCH",
  });
}

export function adminChangeRole(userId: string, role: UserRole) {
  return apiRequest<PublicUser>(`/api/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function adminRemoveUser(userId: string) {
  return apiRequest<undefined>(`/api/users/${userId}`, { method: "DELETE" });
}
