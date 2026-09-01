import { extname } from "node:path";
import { Types, type HydratedDocument } from "mongoose";
import { MAX_STORAGE_BYTES } from "../../shared/constants/index.js";
import { uniqueCopyName } from "../../shared/lib/copy-name.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import { buildBlobKey, copyBlob, deleteBlob } from "../file/blob.store.js";
import { FileModel, toPublicFile } from "../file/file.model.js";
import {
  DirectoryModel,
  toPublicFolder,
  type DirectoryDoc,
} from "./directory.model.js";

type FolderRecord = HydratedDocument<DirectoryDoc>;
type FolderAccess = { includeTrashed?: boolean };

const live = { trashedAt: null };

export async function getFolderListing(userId: string, folderId: string) {
  const folder = await loadOwnedFolder(userId, folderId);
  const [folders, files, ancestors] = await Promise.all([
    DirectoryModel.find({ userId, parentDirId: folder._id, ...live }).sort({
      name: 1,
    }),
    FileModel.find({ userId, parentDirId: folder._id, ...live }).sort({
      name: 1,
    }),
    loadAncestors(folder),
  ]);

  return {
    folder: toPublicFolder(folder),
    ancestors: ancestors.map(toPublicFolder),
    folders: folders.map(toPublicFolder),
    files: files.map(toPublicFile),
  };
}

export async function createFolder(
  userId: string,
  name: string,
  parentId: string,
) {
  const parent = await loadOwnedFolder(userId, parentId);
  await assertFolderNameFree(userId, parent._id.toString(), name);

  const folder = await DirectoryModel.create({
    name,
    userId,
    parentDirId: parent._id,
    ancestorIds: [...parent.ancestorIds, parent._id],
    size: 0,
  });

  return toPublicFolder(folder);
}

export async function renameFolder(
  userId: string,
  folderId: string,
  name: string,
) {
  const folder = await loadOwnedFolder(userId, folderId);
  if (folder.parentDirId == null) {
    throw forbidden("The Home folder cannot be renamed");
  }
  await assertFolderNameFree(
    userId,
    folder.parentDirId.toString(),
    name,
    folderId,
  );
  folder.name = name;
  await folder.save();
  return toPublicFolder(folder);
}

export async function trashFolder(userId: string, folderId: string) {
  const folder = await loadOwnedFolder(userId, folderId);
  if (folder.parentDirId == null) {
    throw forbidden("The Home folder cannot be deleted");
  }
  folder.trashedAt = new Date();
  await folder.save();
  return toPublicFolder(folder);
}

export async function restoreFolder(userId: string, folderId: string) {
  const folder = await loadOwnedFolder(userId, folderId, {
    includeTrashed: true,
  });
  assertIsTrashed(folder.trashedAt);
  if (folder.parentDirId) {
    await assertFolderNameFree(
      userId,
      folder.parentDirId.toString(),
      folder.name,
    );
  }
  folder.trashedAt = null;
  await folder.save();
  return toPublicFolder(folder);
}

export async function purgeFolder(userId: string, folderId: string) {
  const folder = await loadOwnedFolder(userId, folderId, {
    includeTrashed: true,
  });
  if (folder.parentDirId == null) {
    throw forbidden("The Home folder cannot be deleted");
  }

  const descendantIds = await descendantFolderIds(folderId);
  const folderIds = [folderId, ...descendantIds];
  const files = await FileModel.find({ parentDirId: { $in: folderIds } });

  await Promise.all(files.map((file) => deleteBlob(file.storageKey)));
  await FileModel.deleteMany({ parentDirId: { $in: folderIds } });
  await DirectoryModel.deleteMany({ _id: { $in: folderIds } });

  if (folder.size > 0 && folder.parentDirId) {
    await adjustFolderSize(folder.parentDirId.toString(), -folder.size);
  }
}

export async function moveFolder(
  userId: string,
  folderId: string,
  parentId: string,
) {
  const folder = await loadOwnedFolder(userId, folderId);
  const dest = await loadOwnedFolder(userId, parentId);
  if (folder.parentDirId == null) {
    throw forbidden("The Home folder cannot be moved");
  }
  assertCanMoveInto(folder, dest);
  if (folder.parentDirId.toString() === parentId) {
    return toPublicFolder(folder);
  }

  await assertFolderNameFree(userId, parentId, folder.name, folderId);
  const previousParentId = folder.parentDirId.toString();
  const subtreeSize = folder.size;
  await relocateFolder(folder, dest);
  await adjustFolderSize(previousParentId, -subtreeSize);
  await adjustFolderSize(parentId, subtreeSize);
  return toPublicFolder(folder);
}

export async function copyFolder(
  userId: string,
  folderId: string,
  parentId?: string,
) {
  const source = await loadOwnedFolder(userId, folderId);
  const destId =
    parentId ?? source.parentDirId?.toString() ?? source._id.toString();
  const dest = await loadOwnedFolder(userId, destId);
  await assertStorageFits(userId, source.size);
  const copyBesideOriginal =
    destId === source.parentDirId?.toString() ||
    destId === source._id.toString();
  const name = await nextFolderCopyName(
    userId,
    destId,
    source.name,
    copyBesideOriginal,
  );
  const copied = await copyFolderTree(userId, source, dest, name);
  return toPublicFolder(copied);
}

export async function starFolder(userId: string, folderId: string) {
  const folder = await loadOwnedFolder(userId, folderId);
  folder.starredAt = new Date();
  await folder.save();
  return toPublicFolder(folder);
}

export async function unstarFolder(userId: string, folderId: string) {
  const folder = await loadOwnedFolder(userId, folderId);
  folder.starredAt = null;
  await folder.save();
  return toPublicFolder(folder);
}

export async function loadOwnedFolder(
  userId: string,
  folderId: string,
  access: FolderAccess = {},
) {
  const folder = await DirectoryModel.findOne({ _id: folderId, userId });
  if (!folder || (!access.includeTrashed && (await isFolderHidden(folder)))) {
    throw notFound("Folder not found");
  }
  return folder;
}

export async function assertFolderNameFree(
  userId: string,
  parentId: string,
  name: string,
  exceptId?: string,
) {
  const existing = await DirectoryModel.findOne({
    userId,
    parentDirId: parentId,
    name,
    ...live,
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  if (existing) {
    throw new ApiError({
      code: ErrorCode.NAME_TAKEN,
      message: "A folder with this name already exists here",
      status: HttpStatus.CONFLICT,
    });
  }
}

export async function assertStorageFits(userId: string, extraBytes: number) {
  const root = await DirectoryModel.findOne({ userId, parentDirId: null });
  const used = root?.size ?? 0;
  if (used + extraBytes > MAX_STORAGE_BYTES) {
    throw new ApiError({
      code: ErrorCode.STORAGE_FULL,
      message: "Not enough storage remaining",
      status: HttpStatus.CONFLICT,
    });
  }
}

export async function adjustFolderSize(folderId: string, delta: number) {
  const folder = await DirectoryModel.findById(folderId);
  if (!folder || delta === 0) return;
  const ids = [...folder.ancestorIds, folder._id];
  await DirectoryModel.updateMany(
    { _id: { $in: ids } },
    { $inc: { size: delta } },
  );
}

export async function isFolderHidden(folder: {
  trashedAt?: Date | null;
  ancestorIds: Types.ObjectId[];
}) {
  if (folder.trashedAt) return true;
  if (folder.ancestorIds.length === 0) return false;
  const hidden = await DirectoryModel.exists({
    _id: { $in: folder.ancestorIds },
    trashedAt: { $ne: null },
  });
  return Boolean(hidden);
}

async function relocateFolder(folder: FolderRecord, dest: FolderRecord) {
  const oldPrefix = [...folder.ancestorIds, folder._id];
  const newPrefix = [...dest.ancestorIds, dest._id, folder._id];
  folder.parentDirId = dest._id;
  folder.ancestorIds = [...dest.ancestorIds, dest._id];
  await folder.save();

  const descendants = await DirectoryModel.find({ ancestorIds: folder._id });
  await Promise.all(
    descendants.map((item) => {
      item.ancestorIds = [
        ...newPrefix,
        ...item.ancestorIds.slice(oldPrefix.length),
      ];
      return item.save();
    }),
  );
}

async function copyFolderTree(
  userId: string,
  source: FolderRecord,
  dest: FolderRecord,
  name: string,
) {
  const created = await DirectoryModel.create({
    name,
    userId,
    parentDirId: dest._id,
    ancestorIds: [...dest.ancestorIds, dest._id],
    size: 0,
  });

  const childFolders = await DirectoryModel.find({
    userId,
    parentDirId: source._id,
    ...live,
  });
  for (const child of childFolders) {
    await copyFolderTree(userId, child, created, child.name);
  }

  const childFiles = await FileModel.find({
    userId,
    parentDirId: source._id,
    ...live,
  });
  for (const file of childFiles) {
    await duplicateFileInto(userId, file, created._id.toString(), file.name);
  }

  return created;
}

async function duplicateFileInto(
  userId: string,
  source: { name: string; size: number; mimeType: string; storageKey: string },
  parentId: string,
  name: string,
) {
  const fileId = new Types.ObjectId();
  const storageKey = buildBlobKey(userId, fileId.toString(), extname(name));
  await copyBlob(source.storageKey, storageKey);
  await FileModel.create({
    _id: fileId,
    name,
    userId,
    parentDirId: parentId,
    size: source.size,
    mimeType: source.mimeType,
    storageKey,
  });
  await adjustFolderSize(parentId, source.size);
}

async function nextFolderCopyName(
  userId: string,
  parentId: string,
  name: string,
  forceSuffix: boolean,
) {
  const siblings = await DirectoryModel.find({
    userId,
    parentDirId: parentId,
    ...live,
  }).select("name");
  return uniqueCopyName(
    name,
    new Set(siblings.map((item) => item.name)),
    forceSuffix,
  );
}

function assertCanMoveInto(folder: FolderRecord, dest: FolderRecord) {
  const destId = dest._id.toString();
  const folderId = folder._id.toString();
  if (
    destId === folderId ||
    dest.ancestorIds.some((id) => id.toString() === folderId)
  ) {
    throw new ApiError({
      code: ErrorCode.INVALID_PARENT,
      message: "A folder cannot be moved into itself",
      status: HttpStatus.CONFLICT,
    });
  }
}

function assertIsTrashed(trashedAt: Date | null | undefined) {
  if (!trashedAt) {
    throw new ApiError({
      code: ErrorCode.NOT_TRASHED,
      message: "Item is not in trash",
      status: HttpStatus.CONFLICT,
    });
  }
}

function forbidden(message: string) {
  return new ApiError({
    code: ErrorCode.FORBIDDEN,
    message,
    status: HttpStatus.FORBIDDEN,
  });
}

function notFound(message: string) {
  return new ApiError({
    code: ErrorCode.NOT_FOUND,
    message,
    status: HttpStatus.NOT_FOUND,
  });
}

async function descendantFolderIds(folderId: string) {
  const folders = await DirectoryModel.find({ ancestorIds: folderId }).select(
    "_id",
  );
  return folders.map((folder) => folder._id.toString());
}

async function loadAncestors(folder: FolderRecord) {
  if (folder.ancestorIds.length === 0) return [];
  const found = await DirectoryModel.find({ _id: { $in: folder.ancestorIds } });
  const byId = new Map(found.map((item) => [item._id.toString(), item]));
  return folder.ancestorIds
    .map((id) => byId.get(id.toString()))
    .filter((item): item is FolderRecord => Boolean(item));
}
