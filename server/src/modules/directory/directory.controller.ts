import type { Request, Response } from "express";
import { signedInUser } from "../auth/auth.middleware.js";
import { ApiResponse, HttpStatus } from "../../shared/http/index.js";
import { listingQueryOf } from "../../shared/listing/index.js";
import {
  copyFolder,
  createFolder,
  getFolderListing,
  moveFolder,
  purgeFolder,
  renameFolder,
  restoreFolder,
  starFolder,
  trashFolder,
  unstarFolder,
} from "./directory.service.js";
import type {
  CopyFolderBody,
  CreateFolderBody,
  FolderIdParams,
  MoveFolderBody,
  RenameFolderBody,
} from "./directory.types.js";

export async function getRootFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const data = await getFolderListing(
    user.id,
    user.rootDirId,
    listingQueryOf(req.query, "children"),
  );
  return ApiResponse.success(res, { message: "Folder loaded", data });
}

export async function getFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  const data = await getFolderListing(
    user.id,
    folderId,
    listingQueryOf(req.query, "children"),
  );
  return ApiResponse.success(res, { message: "Folder loaded", data });
}

export async function postFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { name, parentId } = req.body as CreateFolderBody;
  const folder = await createFolder(user.id, name, parentId ?? user.rootDirId);
  return ApiResponse.success(res, {
    message: "Folder created",
    status: HttpStatus.CREATED,
    data: folder,
  });
}

export async function patchFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  const { name } = req.body as RenameFolderBody;
  const folder = await renameFolder(user.id, folderId, name);
  return ApiResponse.success(res, { message: "Folder renamed", data: folder });
}

export async function removeFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  const folder = await trashFolder(user.id, folderId);
  return ApiResponse.success(res, {
    message: "Folder moved to trash",
    data: folder,
  });
}

export async function restoreOwnedFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  const folder = await restoreFolder(user.id, folderId);
  return ApiResponse.success(res, { message: "Folder restored", data: folder });
}

export async function purgeOwnedFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  await purgeFolder(user.id, folderId);
  return ApiResponse.success(res, { message: "Folder permanently deleted" });
}

export async function moveOwnedFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  const { parentId } = req.body as MoveFolderBody;
  const folder = await moveFolder(user.id, folderId, parentId);
  return ApiResponse.success(res, { message: "Folder moved", data: folder });
}

export async function copyOwnedFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  const { parentId } = req.body as CopyFolderBody;
  const folder = await copyFolder(user.id, folderId, parentId);
  return ApiResponse.success(res, {
    message: "Folder copied",
    status: HttpStatus.CREATED,
    data: folder,
  });
}

export async function starOwnedFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  const folder = await starFolder(user.id, folderId);
  return ApiResponse.success(res, { message: "Folder starred", data: folder });
}

export async function unstarOwnedFolder(req: Request, res: Response) {
  const user = signedInUser(req);
  const { folderId } = req.params as FolderIdParams;
  const folder = await unstarFolder(user.id, folderId);
  return ApiResponse.success(res, {
    message: "Folder unstarred",
    data: folder,
  });
}
