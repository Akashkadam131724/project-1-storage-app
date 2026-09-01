import type { z } from "zod";
import type {
  copyFileSchema,
  fileIdParamsSchema,
  moveFileSchema,
  renameFileSchema,
  uploadFileSchema,
} from "./file.validation.js";

export type FileIdParams = z.infer<typeof fileIdParamsSchema>;
export type UploadFileBody = z.infer<typeof uploadFileSchema>;
export type RenameFileBody = z.infer<typeof renameFileSchema>;
export type MoveFileBody = z.infer<typeof moveFileSchema>;
export type CopyFileBody = z.infer<typeof copyFileSchema>;
