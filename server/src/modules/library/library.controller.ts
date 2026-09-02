import type { Request, Response } from "express";
import { signedInUser } from "../auth/auth.middleware.js";
import { ApiResponse } from "../../shared/http/index.js";
import { listingQueryOf } from "../../shared/listing/index.js";
import { listRecent, listStarred, listTrash } from "./library.service.js";

export async function getTrash(req: Request, res: Response) {
  const user = signedInUser(req);
  const data = await listTrash(user.id, listingQueryOf(req.query, "trash"));
  return ApiResponse.success(res, { message: "Trash loaded", data });
}

export async function getStarred(req: Request, res: Response) {
  const user = signedInUser(req);
  const data = await listStarred(user.id, listingQueryOf(req.query, "starred"));
  return ApiResponse.success(res, { message: "Starred items loaded", data });
}

export async function getRecent(req: Request, res: Response) {
  const user = signedInUser(req);
  const data = await listRecent(user.id, listingQueryOf(req.query, "recent"));
  return ApiResponse.success(res, { message: "Recent files loaded", data });
}
