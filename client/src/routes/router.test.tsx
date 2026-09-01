import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../contexts/auth-provider.tsx";
import { ThemeProvider } from "../contexts/theme/theme-provider.tsx";
import { paths } from "../utils/paths.ts";
import { createQueryClient } from "../utils/query-client.ts";
import { routes } from "./index.ts";

const demoUser = {
  id: "1",
  name: "Ada Lovelace",
  email: "ada@storage.app",
  role: "user",
  rootDirId: "root1",
  picture: "",
  authProvider: "password",
  hasPassword: true,
};

const emptyListing = {
  folder: {
    id: "root1",
    name: "Home",
    parentId: null,
    size: 0,
    isRoot: true,
    isStarred: false,
    isTrashed: false,
    createdAt: "",
    updatedAt: "",
  },
  ancestors: [],
  folders: { items: [], page: 1, limit: 100, total: 0, totalPages: 0 },
  files: { items: [], page: 1, limit: 100, total: 0, totalPages: 0 },
};

function jsonOk(data: unknown, message = "ok") {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, message, data }),
  };
}

function jsonFail(status: number, code: string, message: string) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ success: false, code, message }),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function mockSignedIn() {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = requestUrl(input);
      if (url.includes("/api/users/me")) {
        return Promise.resolve(jsonOk(demoUser));
      }
      if (url.includes("/api/directories")) {
        return Promise.resolve(jsonOk(emptyListing));
      }
      if (url.includes("/api/trash") || url.includes("/api/starred")) {
        return Promise.resolve(
          jsonOk({
            folders: emptyListing.folders,
            files: emptyListing.files,
          }),
        );
      }
      if (url.includes("/api/recent")) {
        return Promise.resolve(
          jsonOk({
            items: [],
            page: 1,
            limit: 100,
            total: 0,
            totalPages: 0,
          }),
        );
      }
      return Promise.resolve(jsonFail(404, "NOT_FOUND", "missing"));
    }),
  );
}

function mockSignedOut() {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve(jsonFail(401, "UNAUTHENTICATED", "Sign in required")),
    ),
  );
}

function renderPath(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe("app routes", () => {
  it("sends guests from Home to sign in", async () => {
    mockSignedOut();
    renderPath(paths.home);
    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
  });

  it("renders the Drive-like Home canvas when signed in", async () => {
    mockSignedIn();
    renderPath(paths.home);
    expect(
      await screen.findByRole("heading", { name: "Home" }),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search in Storage"),
    ).toBeInTheDocument();
    expect(await screen.findByText("This folder is empty")).toBeInTheDocument();
  });

  it("renders the sign-in page", async () => {
    mockSignedOut();
    renderPath(paths.login);
    expect(
      await screen.findByRole("heading", { name: "Welcome back" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Remember me on this device" }),
    ).toBeInTheDocument();
  });

  it("renders a not-found page", () => {
    renderPath("/does-not-exist");
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
  });

  it("renders the trash empty state", async () => {
    mockSignedIn();
    renderPath(paths.trash);
    expect(
      await screen.findByRole("heading", { name: "Trash" }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Trash is empty")).toBeInTheDocument();
    });
  });

  it("lists five appearance themes", async () => {
    mockSignedIn();
    const user = userEvent.setup();
    renderPath(paths.home);
    await screen.findByRole("heading", { name: "Home" });
    await user.click(screen.getByRole("button", { name: "Choose theme" }));
    const choices = screen
      .getAllByRole("button")
      .map((button) => button.textContent)
      .filter((name) =>
        ["Ocean", "Paper", "Sand", "Midnight", "Nord"].includes(name ?? ""),
      );
    expect(choices[0]).toBe("Ocean");
    expect(screen.getByRole("button", { name: "Paper" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ocean" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sand" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Midnight" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nord" })).toBeInTheDocument();
  });
});
