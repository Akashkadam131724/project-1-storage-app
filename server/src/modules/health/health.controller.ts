import type { Request, Response } from "express";
import { ApiResponse } from "../../shared/http/index.js";
import { getHealth } from "./health.service.js";

export function health(_req: Request, res: Response) {
  return ApiResponse.success(res, { message: "ok", data: getHealth() });
}
