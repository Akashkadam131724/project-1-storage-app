import type { Request, Response } from "express";
import { signedInUser } from "../auth/auth.middleware.js";
import {
  ApiError,
  ApiResponse,
  ErrorCode,
  HttpStatus,
} from "../../shared/http/index.js";
import {
  copyFile,
  getFileMeta,
  moveFile,
  purgeFile,
  readOwnedFile,
  renameFile,
  restoreFile,
  starFile,
  trashFile,
  unstarFile,
  uploadFile,
} from "./file.service.js";
import type {
  CopyFileBody,
  FileIdParams,
  MoveFileBody,
  RenameFileBody,
  UploadFileBody,
} from "./file.types.js";

export async function postFile(req: Request, res: Response) {
  const user = signedInUser(req);
  if (!req.file) {
    throw new ApiError({
      code: ErrorCode.VALIDATION_ERROR,
      message: "File is required",
      status: HttpStatus.BAD_REQUEST,
    });
  }
  const { parentId } = req.body as UploadFileBody;
  const file = await uploadFile(user.id, parentId ?? user.rootDirId, req.file);
  return ApiResponse.success(res, {
    message: "File uploaded",
    status: HttpStatus.CREATED,
    data: file,
  });
}

export async function getFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const file = await getFileMeta(user.id, fileId);
  return ApiResponse.success(res, { message: "File loaded", data: file });
}

export async function downloadFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const { file, contents } = await readOwnedFile(user.id, fileId);
  res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    contentDisposition(file.name, req.query),
  );
  return res.status(HttpStatus.OK).send(contents);
}

export async function patchFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const { name } = req.body as RenameFileBody;
  const file = await renameFile(user.id, fileId, name);
  return ApiResponse.success(res, { message: "File renamed", data: file });
}

export async function removeFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const file = await trashFile(user.id, fileId);
  return ApiResponse.success(res, {
    message: "File moved to trash",
    data: file,
  });
}

export async function restoreOwnedFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const file = await restoreFile(user.id, fileId);
  return ApiResponse.success(res, { message: "File restored", data: file });
}

export async function purgeOwnedFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  await purgeFile(user.id, fileId);
  return ApiResponse.success(res, { message: "File permanently deleted" });
}

export async function moveOwnedFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const { parentId } = req.body as MoveFileBody;
  const file = await moveFile(user.id, fileId, parentId);
  return ApiResponse.success(res, { message: "File moved", data: file });
}

export async function copyOwnedFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const { parentId } = req.body as CopyFileBody;
  const file = await copyFile(user.id, fileId, parentId);
  return ApiResponse.success(res, {
    message: "File copied",
    status: HttpStatus.CREATED,
    data: file,
  });
}

export async function starOwnedFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const file = await starFile(user.id, fileId);
  return ApiResponse.success(res, { message: "File starred", data: file });
}

export async function unstarOwnedFile(req: Request, res: Response) {
  const user = signedInUser(req);
  const { fileId } = req.params as FileIdParams;
  const file = await unstarFile(user.id, fileId);
  return ApiResponse.success(res, { message: "File unstarred", data: file });
}

function contentDisposition(name: string, query: Request["query"]) {
  const download = query.download === "1" || query.download === "true";
  const mode = download ? "attachment" : "inline";
  return `${mode}; filename*=UTF-8''${encodeURIComponent(name)}`;
}
