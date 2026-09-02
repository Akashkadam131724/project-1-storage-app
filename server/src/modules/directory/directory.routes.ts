import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { validateBody } from "../../shared/middleware/validate-body.js";
import { validateParams } from "../../shared/middleware/validate-params.js";
import { validateQuery } from "../../shared/middleware/validate-query.js";
import { listingQuerySchema } from "../../shared/listing/index.js";
import {
  copyOwnedFolder,
  getFolder,
  getRootFolder,
  moveOwnedFolder,
  patchFolder,
  postFolder,
  purgeOwnedFolder,
  removeFolder,
  restoreOwnedFolder,
  starOwnedFolder,
  unstarOwnedFolder,
} from "./directory.controller.js";
import {
  copyFolderSchema,
  createFolderSchema,
  folderIdParamsSchema,
  moveFolderSchema,
  renameFolderSchema,
} from "./directory.validation.js";

export const directoryRouter = Router();

directoryRouter.use(requireAuth);

directoryRouter.get("/", validateQuery(listingQuerySchema), getRootFolder);
directoryRouter.post("/", validateBody(createFolderSchema), postFolder);
directoryRouter.post(
  "/:folderId/restore",
  validateParams(folderIdParamsSchema),
  restoreOwnedFolder,
);
directoryRouter.post(
  "/:folderId/move",
  validateParams(folderIdParamsSchema),
  validateBody(moveFolderSchema),
  moveOwnedFolder,
);
directoryRouter.post(
  "/:folderId/copy",
  validateParams(folderIdParamsSchema),
  validateBody(copyFolderSchema),
  copyOwnedFolder,
);
directoryRouter.post(
  "/:folderId/star",
  validateParams(folderIdParamsSchema),
  starOwnedFolder,
);
directoryRouter.post(
  "/:folderId/unstar",
  validateParams(folderIdParamsSchema),
  unstarOwnedFolder,
);
directoryRouter.delete(
  "/:folderId/permanent",
  validateParams(folderIdParamsSchema),
  purgeOwnedFolder,
);
directoryRouter.get(
  "/:folderId",
  validateParams(folderIdParamsSchema),
  validateQuery(listingQuerySchema),
  getFolder,
);
directoryRouter.patch(
  "/:folderId",
  validateParams(folderIdParamsSchema),
  validateBody(renameFolderSchema),
  patchFolder,
);
directoryRouter.delete(
  "/:folderId",
  validateParams(folderIdParamsSchema),
  removeFolder,
);
