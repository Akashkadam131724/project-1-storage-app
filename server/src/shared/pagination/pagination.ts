import { z } from "zod";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../constants/index.js";

export type PaginationQuery = {
  page: number;
  limit: number;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
});

export function pageOffset({ page, limit }: PaginationQuery) {
  return (page - 1) * limit;
}

export function toPaginated<T>(
  items: T[],
  total: number,
  { page, limit }: PaginationQuery,
): Paginated<T> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function paginateArray<T>(
  items: T[],
  pagination: PaginationQuery,
): Paginated<T> {
  const start = pageOffset(pagination);
  return toPaginated(
    items.slice(start, start + pagination.limit),
    items.length,
    pagination,
  );
}

export function paginationOf(query: unknown): PaginationQuery {
  return paginationQuerySchema.parse(query);
}
