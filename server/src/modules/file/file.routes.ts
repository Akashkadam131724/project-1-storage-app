import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middleware/validate-body.js";
import { validateParams } from "../../shared/middleware/validate-params.js";
import {
  copyOwnedFile,
  downloadFile,
  getFile,
  moveOwnedFile,
  patchFile,
  postFile,
  purgeOwnedFile,
  removeFile,
  restoreOwnedFile,
  starOwnedFile,
  unstarOwnedFile,
} from "./file.controller.js";
import { receiveUpload } from "./file.upload.js";
import {
  copyFileSchema,
  fileIdParamsSchema,
  moveFileSchema,
  renameFileSchema,
  uploadFileSchema,
} from "./file.validation.js";

export const fileRouter = Router();

fileRouter.use(requireAuth);

fileRouter.post("/", receiveUpload, validateBody(uploadFileSchema), postFile);
fileRouter.post(
  "/:fileId/restore",
  validateParams(fileIdParamsSchema),
  restoreOwnedFile,
);
fileRouter.post(
  "/:fileId/move",
  validateParams(fileIdParamsSchema),
  validateBody(moveFileSchema),
  moveOwnedFile,
);
fileRouter.post(
  "/:fileId/copy",
  validateParams(fileIdParamsSchema),
  validateBody(copyFileSchema),
  copyOwnedFile,
);
fileRouter.post(
  "/:fileId/star",
  validateParams(fileIdParamsSchema),
  starOwnedFile,
);
fileRouter.post(
  "/:fileId/unstar",
  validateParams(fileIdParamsSchema),
  unstarOwnedFile,
);
fileRouter.delete(
  "/:fileId/permanent",
  validateParams(fileIdParamsSchema),
  purgeOwnedFile,
);
fileRouter.get(
  "/:fileId/content",
  validateParams(fileIdParamsSchema),
  downloadFile,
);
fileRouter.get("/:fileId", validateParams(fileIdParamsSchema), getFile);
fileRouter.patch(
  "/:fileId",
  validateParams(fileIdParamsSchema),
  validateBody(renameFileSchema),
  patchFile,
);
fileRouter.delete("/:fileId", validateParams(fileIdParamsSchema), removeFile);
