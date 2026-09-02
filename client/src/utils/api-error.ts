import { toast } from "sonner";
import { ApiError } from "../apis/http.ts";

export function toastApiError(
  error: unknown,
  fallback = "Something went wrong",
) {
  const message = error instanceof ApiError ? error.message : fallback;
  toast.error(message);
}
