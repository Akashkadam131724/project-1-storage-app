const units = ["B", "KB", "MB", "GB"] as const;

export function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 MB";
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const digits = value >= 10 || unit === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unit]}`;
}

export const MAX_STORAGE_BYTES = 500 * 1024 * 1024;
