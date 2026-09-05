import { extname } from "node:path";
import { Types } from "mongoose";
import { MAX_ENTRY_NAME_LENGTH } from "../../shared/constants/index.js";
import { uniqueCopyName } from "../../shared/lib/copy-name.js";
import { ApiError, ErrorCode, HttpStatus } from "../../shared/http/index.js";
import {
  adjustFolderSize,
  assertStorageFits,
  isFolderHidden,
  loadOwnedFolder,
} from "../directory/directory.service.js";
import { DirectoryModel } from "../directory/directory.model.js";
import {
  buildBlobKey,
  copyBlob,
  deleteBlob,
  readBlob,
  saveBlob,
} from "./blob.store.js";
import { FileModel, toPublicFile } from "./file.model.js";

type UploadedBytes = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

type FileAccess = { includeTrashed?: boolean };

const live = { trashedAt: null };

export async function uploadFile(
  userId: string,
  parentId: string,
  uploaded: UploadedBytes,
) {
  const name = sanitizeUploadName(uploaded.originalname);
  await loadOwnedFolder(userId, parentId);
  await assertFileNameFree(userId, parentId, name);
  await assertStorageFits(userId, uploaded.size);

  const fileId = new Types.ObjectId();
  const storageKey = buildBlobKey(userId, fileId.toString(), extname(name));
  await saveBlob(storageKey, uploaded.buffer);

  try {
    const file = await FileModel.create({
      _id: fileId,
      name,
      userId,
      parentDirId: parentId,
      size: uploaded.size,
      mimeType: uploaded.mimetype || "application/octet-stream",
      storageKey,
      lastOpenedAt: new Date(),
    });
    await adjustFolderSize(parentId, uploaded.size);
    return toPublicFile(file);
  } catch (error) {
    await deleteBlob(storageKey);
    throw error;
  }
}

export async function getFileMeta(userId: string, fileId: string) {
  const file = await loadOwnedFile(userId, fileId);
  file.lastOpenedAt = new Date();
  await file.save();
  return toPublicFile(file);
}

export async function readOwnedFile(userId: string, fileId: string) {
  const file = await loadOwnedFile(userId, fileId);
  file.lastOpenedAt = new Date();
  await file.save();
  const contents = await readBlob(file.storageKey);
  return { file, contents };
}

export async function renameFile(userId: string, fileId: string, name: string) {
  const file = await loadOwnedFile(userId, fileId);
  await assertFileNameFree(userId, file.parentDirId.toString(), name, fileId);
  file.name = name;
  await file.save();
  return toPublicFile(file);
}

export async function trashFile(userId: string, fileId: string) {
  const file = await loadOwnedFile(userId, fileId);
  file.trashedAt = new Date();
  await file.save();
  return toPublicFile(file);
}

export async function restoreFile(userId: string, fileId: string) {
  const file = await loadOwnedFile(userId, fileId, { includeTrashed: true });
  if (!file.trashedAt) {
    throw new ApiError({
      code: ErrorCode.NOT_TRASHED,
      message: "Item is not in trash",
      status: HttpStatus.CONFLICT,
    });
  }
  await assertFileNameFree(userId, file.parentDirId.toString(), file.name);
  file.trashedAt = null;
  await file.save();
  return toPublicFile(file);
}

export async function purgeFile(userId: string, fileId: string) {
  const file = await loadOwnedFile(userId, fileId, { includeTrashed: true });
  await deleteBlob(file.storageKey);
  await FileModel.deleteOne({ _id: file._id });
  await adjustFolderSize(file.parentDirId.toString(), -file.size);
}

export async function moveFile(
  userId: string,
  fileId: string,
  parentId: string,
) {
  const file = await loadOwnedFile(userId, fileId);
  await loadOwnedFolder(userId, parentId);
  if (file.parentDirId.toString() === parentId) {
    return toPublicFile(file);
  }
  await assertFileNameFree(userId, parentId, file.name, fileId);
  const previousParentId = file.parentDirId.toString();
  file.parentDirId = new Types.ObjectId(parentId);
  await file.save();
  await adjustFolderSize(previousParentId, -file.size);
  await adjustFolderSize(parentId, file.size);
  return toPublicFile(file);
}

export async function copyFile(
  userId: string,
  fileId: string,
  parentId?: string,
) {
  const file = await loadOwnedFile(userId, fileId);
  const destId = parentId ?? file.parentDirId.toString();
  await loadOwnedFolder(userId, destId);
  await assertStorageFits(userId, file.size);
  const name = await nextFileCopyName(
    userId,
    destId,
    file.name,
    destId === file.parentDirId.toString(),
  );
  return duplicateFile(userId, file, destId, name);
}

export async function starFile(userId: string, fileId: string) {
  const file = await loadOwnedFile(userId, fileId);
  file.starredAt = new Date();
  await file.save();
  return toPublicFile(file);
}

export async function unstarFile(userId: string, fileId: string) {
  const file = await loadOwnedFile(userId, fileId);
  file.starredAt = null;
  await file.save();
  return toPublicFile(file);
}

export async function deleteAllUserFiles(userId: string) {
  const files = await FileModel.find({ userId });
  await Promise.all(files.map((file) => deleteBlob(file.storageKey)));
  await FileModel.deleteMany({ userId });
}

async function duplicateFile(
  userId: string,
  source: {
    name: string;
    size: number;
    mimeType: string;
    storageKey: string;
  },
  parentId: string,
  name: string,
) {
  const fileId = new Types.ObjectId();
  const storageKey = buildBlobKey(userId, fileId.toString(), extname(name));
  await copyBlob(source.storageKey, storageKey);
  const created = await FileModel.create({
    _id: fileId,
    name,
    userId,
    parentDirId: parentId,
    size: source.size,
    mimeType: source.mimeType,
    storageKey,
  });
  await adjustFolderSize(parentId, source.size);
  return toPublicFile(created);
}

async function nextFileCopyName(
  userId: string,
  parentId: string,
  name: string,
  forceSuffix: boolean,
) {
  const siblings = await FileModel.find({
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

async function loadOwnedFile(
  userId: string,
  fileId: string,
  access: FileAccess = {},
) {
  const file = await FileModel.findOne({ _id: fileId, userId });
  if (!file || (!access.includeTrashed && (await isFileHidden(file)))) {
    throw new ApiError({
      code: ErrorCode.NOT_FOUND,
      message: "File not found",
      status: HttpStatus.NOT_FOUND,
    });
  }
  return file;
}

async function isFileHidden(file: {
  trashedAt?: Date | null;
  parentDirId: Types.ObjectId;
}) {
  if (file.trashedAt) return true;
  const parent = await DirectoryModel.findById(file.parentDirId);
  if (!parent) return true;
  return isFolderHidden(parent);
}

async function assertFileNameFree(
  userId: string,
  parentId: string,
  name: string,
  exceptId?: string,
) {
  const existing = await FileModel.findOne({
    userId,
    parentDirId: parentId,
    name,
    ...live,
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  if (existing) {
    throw new ApiError({
      code: ErrorCode.NAME_TAKEN,
      message: "A file with this name already exists here",
      status: HttpStatus.CONFLICT,
    });
  }
}

function sanitizeUploadName(originalName: string) {
  const name = originalName.replace(/^.*[/\\]/, "").trim();
  if (
    !name ||
    name.includes("/") ||
    name.includes("\\") ||
    name.length > MAX_ENTRY_NAME_LENGTH
  ) {
    throw new ApiError({
      code: ErrorCode.VALIDATION_ERROR,
      message: "A valid file name is required",
      status: HttpStatus.BAD_REQUEST,
    });
  }
  return name;
}
