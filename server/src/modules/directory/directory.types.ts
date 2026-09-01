import type { z } from "zod";
import type {
  copyFolderSchema,
  createFolderSchema,
  folderIdParamsSchema,
  moveFolderSchema,
  renameFolderSchema,
} from "./directory.validation.js";

export type CreateFolderBody = z.infer<typeof createFolderSchema>;
export type RenameFolderBody = z.infer<typeof renameFolderSchema>;
export type FolderIdParams = z.infer<typeof folderIdParamsSchema>;
export type MoveFolderBody = z.infer<typeof moveFolderSchema>;
export type CopyFolderBody = z.infer<typeof copyFolderSchema>;
