import { z } from "zod";
import { MAX_ENTRY_NAME_LENGTH } from "../../shared/constants/index.js";

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const entryNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(
    MAX_ENTRY_NAME_LENGTH,
    `Name must be at most ${String(MAX_ENTRY_NAME_LENGTH)} characters`,
  )
  .refine((value) => !value.includes("/") && !value.includes("\\"), {
    message: "Name cannot contain slashes",
  });

export const folderIdParamsSchema = z.object({
  folderId: mongoId,
});

export const createFolderSchema = z.object({
  name: entryNameSchema,
  parentId: mongoId.optional(),
});

export const renameFolderSchema = z.object({
  name: entryNameSchema,
});

export const moveFolderSchema = z.object({
  parentId: mongoId,
});

export const copyFolderSchema = z.object({
  parentId: mongoId.optional(),
});
