import { env } from "../config/env.js";

export function storageQuotaBytes(isGuest: boolean) {
  return isGuest ? env.GUEST_STORAGE_BYTES : env.MAX_STORAGE_BYTES;
}
