import type { PublicUser } from "../apis/types.ts";

export function isAdmin(user: PublicUser | null | undefined) {
  return user?.role === "Admin";
}

export function isGuest(user: PublicUser | null | undefined) {
  return Boolean(user?.isGuest);
}
