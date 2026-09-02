import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest } from "./http.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("returns data from a successful envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            message: "ok",
            data: { id: "1" },
          }),
      }),
    );

    await expect(apiRequest<{ id: string }>("/api/health")).resolves.toEqual({
      id: "1",
    });
  });

  it("throws ApiError from a failed envelope", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            success: false,
            code: "UNAUTHENTICATED",
            message: "Sign in required",
          }),
      }),
    );

    await expect(apiRequest("/api/users/me")).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        code: "UNAUTHENTICATED",
        status: 401,
      }),
    );
    await expect(apiRequest("/api/users/me")).rejects.toBeInstanceOf(ApiError);
  });

  it("does not force JSON content-type for FormData uploads", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () =>
        Promise.resolve({
          success: true,
          message: "File uploaded",
          data: { id: "1" },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/files", {
      method: "POST",
      body: new FormData(),
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toBeUndefined();
  });
});
