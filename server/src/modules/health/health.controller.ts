import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../shared/http/success.js";
import { getHealth } from "./health.service.js";

export function health(_req: Request, res: Response) {
  return sendSuccess(res, "ok", getHealth(), StatusCodes.OK);
}
