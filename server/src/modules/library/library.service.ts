import { RECENT_FILE_LIMIT } from "../../shared/constants/index.js";
import { isFolderHidden } from "../directory/directory.service.js";
import {
  DirectoryModel,
  toPublicFolder,
  type DirectoryDoc,
} from "../directory/directory.model.js";
import { FileModel, toPublicFile, type FileDoc } from "../file/file.model.js";

const explicitlyTrashed = { trashedAt: { $ne: null } };
const liveAndStarred = { trashedAt: null, starredAt: { $ne: null } };

export async function listTrash(userId: string) {
  const [folders, files] = await Promise.all([
    DirectoryModel.find({ userId, ...explicitlyTrashed }).sort({
      trashedAt: -1,
    }),
    FileModel.find({ userId, ...explicitlyTrashed }).sort({ trashedAt: -1 }),
  ]);

  return {
    folders: folders.map(toPublicFolder),
    files: files.map(toPublicFile),
  };
}

export async function listStarred(userId: string) {
  const [folders, files] = await Promise.all([
    DirectoryModel.find({ userId, ...liveAndStarred }).sort({ starredAt: -1 }),
    FileModel.find({ userId, ...liveAndStarred }).sort({ starredAt: -1 }),
  ]);

  const visibleFolders = await filterVisibleFolders(folders);
  const visibleFiles = await filterVisibleFiles(files);

  return {
    folders: visibleFolders.map(toPublicFolder),
    files: visibleFiles.map(toPublicFile),
  };
}

export async function listRecent(userId: string) {
  const candidates = await FileModel.find({
    userId,
    trashedAt: null,
    lastOpenedAt: { $ne: null },
  })
    .sort({ lastOpenedAt: -1 })
    .limit(RECENT_FILE_LIMIT * 2);

  const visible = await filterVisibleFiles(candidates);
  return visible.slice(0, RECENT_FILE_LIMIT).map(toPublicFile);
}

async function filterVisibleFolders(folders: DirectoryDoc[]) {
  const visible: DirectoryDoc[] = [];
  for (const folder of folders) {
    if (!(await isFolderHidden(folder))) {
      visible.push(folder);
    }
  }
  return visible;
}

async function filterVisibleFiles(files: FileDoc[]) {
  const visible: FileDoc[] = [];
  for (const file of files) {
    if (!(await isFileHidden(file))) {
      visible.push(file);
    }
  }
  return visible;
}

async function isFileHidden(file: FileDoc) {
  if (file.trashedAt) return true;
  const parent = await DirectoryModel.findById(file.parentDirId);
  if (!parent) return true;
  return isFolderHidden(parent);
}
