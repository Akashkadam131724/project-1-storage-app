import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateParams<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.params = schema.parse(req.params) as Request["params"];
    next();
  };
}
