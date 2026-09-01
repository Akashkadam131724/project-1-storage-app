import { extname } from "node:path";

export function uniqueCopyName(
  desired: string,
  taken: Set<string>,
  forceSuffix = false,
) {
  if (!forceSuffix && !taken.has(desired)) {
    return desired;
  }

  const extension = extname(desired);
  const base = extension ? desired.slice(0, -extension.length) : desired;
  let index = 0;
  while (true) {
    const suffix = index === 0 ? " (copy)" : ` (copy ${String(index + 1)})`;
    const candidate = `${base}${suffix}${extension}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
    index += 1;
  }
}
