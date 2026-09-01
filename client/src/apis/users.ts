import { apiRequest } from "./http.ts";
import type { PublicUser } from "./types.ts";

export function getMe() {
  return apiRequest<PublicUser>("/api/users/me");
}
