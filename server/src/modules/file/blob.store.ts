import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, posix, relative, resolve } from "node:path";
import { env } from "../../config/env.js";

function storageRoot() {
  return resolve(env.UPLOAD_DIR);
}

function resolveKey(key: string) {
  if (!key || key.includes("..") || key.includes("\\") || key.startsWith("/")) {
    throw new Error("Invalid storage key");
  }
  const root = storageRoot();
  const fullPath = resolve(root, key);
  const rel = relative(root, fullPath);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error("Invalid storage key");
  }
  return fullPath;
}

export async function saveBlob(key: string, contents: Buffer) {
  const fullPath = resolveKey(key);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, contents);
}

export async function readBlob(key: string) {
  return readFile(resolveKey(key));
}

export async function copyBlob(fromKey: string, toKey: string) {
  const contents = await readFile(resolveKey(fromKey));
  await saveBlob(toKey, contents);
}

export async function deleteBlob(key: string) {
  await rm(resolveKey(key), { force: true });
}

export function buildBlobKey(
  userId: string,
  fileId: string,
  extension: string,
) {
  const safeExt = extension.replace(/[^\w.]/g, "");
  return posix.join(userId, `${fileId}${safeExt}`);
}
