import {
  createFolder,
  purgeFolder,
  starFolder,
  trashFolder,
} from "../modules/directory/directory.service.js";
import {
  DirectoryModel,
  type PublicFolder,
} from "../modules/directory/directory.model.js";
import { FileModel } from "../modules/file/file.model.js";
import { purgeFile, uploadFile } from "../modules/file/file.service.js";
import type { UserDoc } from "../modules/user/user.model.js";

const ROOT_DEMO_COUNT = 72;
const NESTED_PARENT_COUNT = 10;
const UPLOAD_CONCURRENCY = 8;
const DEMO_FOLDER_RE = /^Demo \d{2}$/;
const DEMO_HOME_FILE_RE = /^demo-/i;
const NESTED_NAMES = ["Notes", "Assets", "Archive", "Drafts"] as const;
const STARRED_FOLDER_INDEXES = [2, 6, 11, 20];

const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type FileDraft = {
  parentId: string;
  name: string;
  mimeType: string;
  body: Buffer;
  lastOpenedDaysAgo?: number;
  star?: boolean;
  trash?: boolean;
};

export type AdaDriveSummary = {
  folders: number;
  files: number;
};

export async function seedAdaDrive(user: UserDoc): Promise<AdaDriveSummary> {
  const userId = user._id.toString();
  const rootId = user.rootDirId.toString();

  await clearPreviousDemo(userId, rootId);

  const folders = await createRootDemoFolders(userId, rootId);
  const nested = await createNestedFolders(
    userId,
    folders.slice(0, NESTED_PARENT_COUNT),
  );
  const drafts = collectDrafts(rootId, folders, nested);
  await uploadDrafts(userId, drafts);
  await decorateFolders(userId, folders);

  return {
    folders: folders.length + nested.length,
    files: drafts.length,
  };
}

async function clearPreviousDemo(userId: string, rootId: string) {
  const folders = await DirectoryModel.find({
    userId,
    parentDirId: rootId,
    name: DEMO_FOLDER_RE,
  });
  for (const folder of folders) {
    await purgeFolder(userId, folder._id.toString());
  }

  const files = await FileModel.find({
    userId,
    parentDirId: rootId,
    name: DEMO_HOME_FILE_RE,
  });
  for (const file of files) {
    await purgeFile(userId, file._id.toString());
  }
}

async function createRootDemoFolders(userId: string, rootId: string) {
  const names = Array.from({ length: ROOT_DEMO_COUNT }, (_, index) =>
    demoFolderName(index + 1),
  );
  return Promise.all(names.map((name) => createFolder(userId, name, rootId)));
}

async function createNestedFolders(userId: string, parents: PublicFolder[]) {
  return Promise.all(
    parents.flatMap((parent) =>
      NESTED_NAMES.map((name) => createFolder(userId, name, parent.id)),
    ),
  );
}

function collectDrafts(
  rootId: string,
  folders: PublicFolder[],
  nested: PublicFolder[],
) {
  return [
    ...homeDrafts(rootId),
    ...folders.flatMap((folder, index) => folderDrafts(folder, index)),
    ...nested.flatMap((folder) => nestedDrafts(folder)),
  ];
}

function homeDrafts(rootId: string): FileDraft[] {
  return [
    textDraft({
      parentId: rootId,
      name: "demo-welcome.md",
      mimeType: "text/markdown",
      contents: welcomeMarkdown(),
      star: true,
      lastOpenedDaysAgo: 1,
    }),
    textDraft({
      parentId: rootId,
      name: "demo-index.csv",
      mimeType: "text/csv",
      contents: indexCsv(),
      lastOpenedDaysAgo: 2,
    }),
    textDraft({
      parentId: rootId,
      name: "demo-profile.json",
      mimeType: "application/json",
      contents: profileJson(),
      lastOpenedDaysAgo: 3,
    }),
    {
      parentId: rootId,
      name: "demo-thumbnail.png",
      mimeType: "image/png",
      body: PIXEL_PNG,
      lastOpenedDaysAgo: 4,
    },
    textDraft({
      parentId: rootId,
      name: "demo-scratch.txt",
      mimeType: "text/plain",
      contents: scratchNotes(),
      trash: true,
    }),
  ];
}

function folderDrafts(folder: PublicFolder, index: number): FileDraft[] {
  return [
    textDraft({
      parentId: folder.id,
      name: "notes.md",
      mimeType: "text/markdown",
      contents: folderNotes(folder.name),
      star: index % 11 === 0,
      lastOpenedDaysAgo: index < 12 ? index + 1 : undefined,
    }),
    textDraft({
      parentId: folder.id,
      name: "figures.csv",
      mimeType: "text/csv",
      contents: folderCsv(index + 1),
    }),
    textDraft({
      parentId: folder.id,
      name: "brief.json",
      mimeType: "application/json",
      contents: folderBrief(folder.name),
    }),
  ];
}

function nestedDrafts(folder: PublicFolder): FileDraft[] {
  return [
    textDraft({
      parentId: folder.id,
      name: "outline.md",
      mimeType: "text/markdown",
      contents: folderNotes(`${folder.name} outline`),
    }),
    textDraft({
      parentId: folder.id,
      name: "snapshot.json",
      mimeType: "application/json",
      contents: folderBrief(folder.name),
    }),
  ];
}

function textDraft(
  draft: Omit<FileDraft, "body"> & { contents: string },
): FileDraft {
  const { contents, ...rest } = draft;
  return { ...rest, body: Buffer.from(contents, "utf8") };
}

async function uploadDrafts(userId: string, drafts: FileDraft[]) {
  await mapLimit(drafts, UPLOAD_CONCURRENCY, async (draft) => {
    const file = await uploadFile(userId, draft.parentId, {
      originalname: draft.name,
      mimetype: draft.mimeType,
      size: draft.body.length,
      buffer: draft.body,
    });
    await applyFileFlags(file.id, draft);
  });
}

async function applyFileFlags(fileId: string, draft: FileDraft) {
  const patch: Record<string, Date> = {};
  if (draft.lastOpenedDaysAgo != null) {
    patch.lastOpenedAt = daysAgo(draft.lastOpenedDaysAgo);
  }
  if (draft.star) patch.starredAt = new Date();
  if (draft.trash) patch.trashedAt = new Date();
  if (Object.keys(patch).length === 0) return;
  await FileModel.updateOne({ _id: fileId }, patch);
}

async function decorateFolders(userId: string, folders: PublicFolder[]) {
  await Promise.all(
    STARRED_FOLDER_INDEXES.flatMap((index) => {
      const folder = folders[index];
      return folder ? [starFolder(userId, folder.id)] : [];
    }),
  );
  const last = folders.at(-1);
  if (last) await trashFolder(userId, last.id);
}

function demoFolderName(n: number) {
  return `Demo ${String(n).padStart(2, "0")}`;
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function welcomeMarkdown() {
  return [
    "# Ada's demo drive",
    "",
    "Seeded library for browsing, starring, and pagination.",
    "",
    "- Home has 70+ Demo folders",
    "- Early folders contain Notes / Assets / Archive / Drafts",
    "- Small text, CSV, JSON, and PNG files only",
    "",
  ].join("\n");
}

function indexCsv() {
  return "folder,files,kind\nDemo 01,3,project\nDemo 02,3,notes\nDemo 03,3,starred\n";
}

function profileJson() {
  return `${JSON.stringify(
    {
      owner: "Ada Lovelace",
      email: "ada@storage.app",
      seeded: true,
      theme: "analytical-engine",
    },
    null,
    2,
  )}\n`;
}

function scratchNotes() {
  return "Trashed demo scratch file. Restore it from Trash if you want it back.\n";
}

function folderNotes(folderName: string) {
  return `# ${folderName}\n\nWorking notes for ${folderName}.\n\n- Bernoulli numbers\n- Punch cards\n- Stepwise operations\n`;
}

function folderCsv(n: number) {
  return `item,qty,notes\ngears,${String(n)},demo\nlevers,${String(n * 2)},demo\ncards,${String(n + 7)},demo\n`;
}

function folderBrief(folderName: string) {
  return `${JSON.stringify(
    { folder: folderName, owner: "Ada Lovelace", seeded: true },
    null,
    2,
  )}\n`;
}

async function mapLimit<T>(
  items: readonly T[],
  limit: number,
  mapper: (item: T) => Promise<void>,
) {
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item) await mapper(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
}
