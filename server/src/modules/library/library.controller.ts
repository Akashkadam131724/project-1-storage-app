import type { Request, Response } from "express";
import { signedInUser } from "../auth/auth.middleware.js";
import { ApiResponse } from "../../shared/http/index.js";
import { paginationOf } from "../../shared/pagination/index.js";
import { listRecent, listStarred, listTrash } from "./library.service.js";

export async function getTrash(req: Request, res: Response) {
  const user = signedInUser(req);
  const data = await listTrash(user.id, paginationOf(req.query));
  return ApiResponse.success(res, { message: "Trash loaded", data });
}

export async function getStarred(req: Request, res: Response) {
  const user = signedInUser(req);
  const data = await listStarred(user.id, paginationOf(req.query));
  return ApiResponse.success(res, { message: "Starred items loaded", data });
}

export async function getRecent(req: Request, res: Response) {
  const user = signedInUser(req);
  const data = await listRecent(user.id, paginationOf(req.query));
  return ApiResponse.success(res, { message: "Recent files loaded", data });
}
