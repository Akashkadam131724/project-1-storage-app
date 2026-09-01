import { z } from "zod";
import { entryNameSchema } from "../directory/directory.validation.js";

const mongoId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const fileIdParamsSchema = z.object({
  fileId: mongoId,
});

export const uploadFileSchema = z.object({
  parentId: mongoId.optional(),
});

export const renameFileSchema = z.object({
  name: entryNameSchema,
});

export const moveFileSchema = z.object({
  parentId: mongoId,
});

export const copyFileSchema = z.object({
  parentId: mongoId.optional(),
});
