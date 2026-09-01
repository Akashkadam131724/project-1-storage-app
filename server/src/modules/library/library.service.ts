import { isFolderHidden } from "../directory/directory.service.js";
import {
  DirectoryModel,
  toPublicFolder,
  type DirectoryDoc,
} from "../directory/directory.model.js";
import { FileModel, toPublicFile, type FileDoc } from "../file/file.model.js";
import {
  pageOffset,
  paginateArray,
  toPaginated,
  type PaginationQuery,
} from "../../shared/pagination/index.js";

const explicitlyTrashed = { trashedAt: { $ne: null } };
const liveAndStarred = { trashedAt: null, starredAt: { $ne: null } };

export async function listTrash(userId: string, pagination: PaginationQuery) {
  const filter = { userId, ...explicitlyTrashed };
  const skip = pageOffset(pagination);
  const [folderDocs, folderTotal, fileDocs, fileTotal] = await Promise.all([
    DirectoryModel.find(filter)
      .sort({ trashedAt: -1 })
      .skip(skip)
      .limit(pagination.limit),
    DirectoryModel.countDocuments(filter),
    FileModel.find(filter)
      .sort({ trashedAt: -1 })
      .skip(skip)
      .limit(pagination.limit),
    FileModel.countDocuments(filter),
  ]);

  return {
    folders: toPaginated(
      folderDocs.map(toPublicFolder),
      folderTotal,
      pagination,
    ),
    files: toPaginated(fileDocs.map(toPublicFile), fileTotal, pagination),
  };
}

export async function listStarred(userId: string, pagination: PaginationQuery) {
  const [folders, files] = await Promise.all([
    DirectoryModel.find({ userId, ...liveAndStarred }).sort({ starredAt: -1 }),
    FileModel.find({ userId, ...liveAndStarred }).sort({ starredAt: -1 }),
  ]);

  return {
    folders: paginateArray(
      (await filterVisibleFolders(folders)).map(toPublicFolder),
      pagination,
    ),
    files: paginateArray(
      (await filterVisibleFiles(files)).map(toPublicFile),
      pagination,
    ),
  };
}

export async function listRecent(userId: string, pagination: PaginationQuery) {
  const candidates = await FileModel.find({
    userId,
    trashedAt: null,
    lastOpenedAt: { $ne: null },
  }).sort({ lastOpenedAt: -1 });

  return paginateArray(
    (await filterVisibleFiles(candidates)).map(toPublicFile),
    pagination,
  );
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
