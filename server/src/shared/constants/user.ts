export const USER_ROLES = ["User", "Admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const DEFAULT_USER_ROLE = "User" satisfies UserRole;
export const ADMIN_ROLE = "Admin" satisfies UserRole;
