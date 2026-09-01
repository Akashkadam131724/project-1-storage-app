import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    schema.parse(req.query ?? {});
    next();
  };
}
