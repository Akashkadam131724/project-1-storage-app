import { env } from "../utils/env.ts";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data?: T;
};

export type ApiFailure = {
  success: false;
  code: string;
  message: string;
  details?: unknown;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: jsonHeaders(init),
  });

  const body = (await response.json()) as ApiSuccess<T> | ApiFailure;
  if (!response.ok || !body.success) {
    const failure = body as ApiFailure;
    throw new ApiError(
      failure.code ?? "INTERNAL_ERROR",
      failure.message ?? "Request failed",
      response.status,
      failure.details,
    );
  }

  return body.data as T;
}

function jsonHeaders(init: RequestInit) {
  const headers = new Headers(init.headers);
  const isFormData = init.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}
