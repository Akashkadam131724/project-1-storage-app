import { isFolderHidden } from "../directory/directory.service.js";
import {
  DirectoryModel,
  toPublicFolder,
  type DirectoryDoc,
} from "../directory/directory.model.js";
import { FileModel, toPublicFile, type FileDoc } from "../file/file.model.js";
import {
  applyListingSort,
  mergeListingDocs,
  type ListingQuery,
} from "../../shared/listing/index.js";
import {
  pageOffset,
  paginateArray,
  toPaginated,
} from "../../shared/pagination/index.js";

const explicitlyTrashed = { trashedAt: { $ne: null } };
const liveAndStarred = { trashedAt: null, starredAt: { $ne: null } };

export async function listTrash(userId: string, listing: ListingQuery) {
  const filter = { userId, ...explicitlyTrashed };

  if (listing.folders === "mixed") {
    const [allFolders, allFiles] = await Promise.all([
      applyListingSort(DirectoryModel.find(filter), "folder", listing, "trash"),
      applyListingSort(FileModel.find(filter), "file", listing, "trash"),
    ]);
    return paginatedLibrary(allFolders, allFiles, listing, "trash");
  }

  const skip = pageOffset(listing);
  const [folderDocs, folderTotal, fileDocs, fileTotal] = await Promise.all([
    applyListingSort(DirectoryModel.find(filter), "folder", listing, "trash")
      .skip(skip)
      .limit(listing.limit),
    DirectoryModel.countDocuments(filter),
    applyListingSort(FileModel.find(filter), "file", listing, "trash")
      .skip(skip)
      .limit(listing.limit),
    FileModel.countDocuments(filter),
  ]);

  return {
    folders: toPaginated(folderDocs.map(toPublicFolder), folderTotal, listing),
    files: toPaginated(fileDocs.map(toPublicFile), fileTotal, listing),
  };
}

export async function listStarred(userId: string, listing: ListingQuery) {
  const [folderDocs, fileDocs] = await Promise.all([
    applyListingSort(
      DirectoryModel.find({ userId, ...liveAndStarred }),
      "folder",
      listing,
      "starred",
    ),
    applyListingSort(
      FileModel.find({ userId, ...liveAndStarred }),
      "file",
      listing,
      "starred",
    ),
  ]);
  const folders = await filterVisibleFolders(folderDocs);
  const files = await filterVisibleFiles(fileDocs);
  return paginatedLibrary(folders, files, listing, "starred");
}

export async function listRecent(userId: string, listing: ListingQuery) {
  const candidates = await applyListingSort(
    FileModel.find({
      userId,
      trashedAt: null,
      lastOpenedAt: { $ne: null },
    }),
    "file",
    listing,
    "recent",
  );

  return paginateArray(
    (await filterVisibleFiles(candidates)).map(toPublicFile),
    listing,
  );
}

function paginatedLibrary(
  folders: DirectoryDoc[],
  files: FileDoc[],
  listing: ListingQuery,
  context: "trash" | "starred",
) {
  const result = {
    folders: paginateArray(folders.map(toPublicFolder), listing),
    files: paginateArray(files.map(toPublicFile), listing),
  };
  if (listing.folders !== "mixed") {
    return result;
  }
  return {
    ...result,
    entries: paginateArray(
      mergeListingDocs(folders, files, listing, context).map((entry) =>
        entry.type === "folder"
          ? { type: "folder" as const, folder: toPublicFolder(entry.item) }
          : { type: "file" as const, file: toPublicFile(entry.item) },
      ),
      listing,
    ),
  };
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
