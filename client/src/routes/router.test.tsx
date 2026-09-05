import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../contexts/auth-provider.tsx";
import { ThemeProvider } from "../contexts/theme/theme-provider.tsx";
import { env } from "../utils/env.ts";
import { paths } from "../utils/paths.ts";
import { createQueryClient } from "../utils/query-client.ts";
import { routes } from "./index.ts";

const demoUser = {
  id: "1",
  name: "Ada Lovelace",
  email: "ada@storage.app",
  role: "User",
  rootDirId: "root1",
  picture: "",
  authProvider: "password",
  hasPassword: true,
  isGuest: false,
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
  localStorage.removeItem("storage-layout");
  localStorage.removeItem("storage-sort");
  localStorage.removeItem("storage-roadmap");
});

function requestUrl(input: RequestInfo | URL) {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

const guestUser = {
  ...demoUser,
  name: "Guest",
  email: "guest.x@guest.storage.app",
  hasPassword: false,
  isGuest: true,
};

function mockSignedIn(user = demoUser) {
  vi.stubGlobal(
    "fetch",
    vi.fn((input: RequestInfo | URL) => {
      const url = requestUrl(input);
      if (url.includes("/api/users/me")) {
        return Promise.resolve(jsonOk(user));
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

function renderPath(path: string, history?: string[]) {
  const entries = history ?? [path];
  const router = createMemoryRouter(routes, {
    initialEntries: entries,
    initialIndex: entries.length - 1,
  });
  const tree = (
    <ThemeProvider>
      <QueryClientProvider client={createQueryClient()}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );

  if (!env.VITE_GOOGLE_CLIENT_ID) {
    return render(tree);
  }

  return render(
    <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
      {tree}
    </GoogleOAuthProvider>,
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
    expect(
      screen.getByRole("link", { name: "Forgot password?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with GitHub" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue as guest" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Project roadmap" }),
    ).toBeInTheDocument();
  });

  it("lets anyone open the public roadmap", async () => {
    mockSignedOut();
    renderPath(paths.roadmap);
    expect(
      await screen.findByRole("heading", { name: "Roadmap" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Repo setup: Prettier and Husky"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("shows a keep-files banner for guest sessions", async () => {
    mockSignedIn(guestUser);
    renderPath(paths.home);
    expect(
      await screen.findByRole("heading", { name: "Home" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You are browsing as a guest/i),
    ).toBeInTheDocument();
  });

  it("lets a guest open the register page", async () => {
    mockSignedIn(guestUser);
    renderPath(paths.register);
    expect(
      await screen.findByRole("heading", { name: "Keep your files" }),
    ).toBeInTheDocument();
  });

  it("keeps guest settings as links only", async () => {
    mockSignedIn(guestUser);
    renderPath(paths.settings);
    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Name and email")).toBeInTheDocument();
    expect(screen.getByText("Theme for this device")).toBeInTheDocument();
    expect(screen.queryByText("Keep your files")).not.toBeInTheDocument();
    expect(screen.queryByText("Reset password")).not.toBeInTheDocument();
    expect(screen.queryByText("Set a password")).not.toBeInTheDocument();
    expect(screen.queryByText("Danger zone")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();
  });

  it("renders the password reset page", async () => {
    mockSignedOut();
    renderPath(paths.forgot);
    expect(
      await screen.findByRole("heading", { name: "Reset your password" }),
    ).toBeInTheDocument();
  });

  it("renders settings for a signed-in user", async () => {
    mockSignedIn();
    renderPath(paths.settings);
    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Name and email")).toBeInTheDocument();
    expect(screen.getByText("Theme for this device")).toBeInTheDocument();
    expect(screen.getByText("Reset password")).toBeInTheDocument();
    expect(screen.getByText("Auth on prod, then S3")).toBeInTheDocument();
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();
  });

  it("sends account pages back to the previous route", async () => {
    mockSignedIn();
    const user = userEvent.setup();
    renderPath(paths.profile, [paths.home, paths.settings, paths.profile]);
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(
      await screen.findByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(
      await screen.findByRole("heading", { name: "Home" }),
    ).toBeInTheDocument();
  });

  it("keeps non-admins off the admin page", async () => {
    mockSignedIn();
    renderPath(paths.admin);
    expect(
      await screen.findByRole("heading", { name: "Home" }),
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
    expect(
      screen.getByRole("button", { name: "Grid view" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "List view" }),
    ).toBeInTheDocument();
  });

  it("lists five appearance themes on their own page", async () => {
    mockSignedIn();
    renderPath(paths.appearance);
    expect(
      await screen.findByRole("heading", { name: "Appearance" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ocean/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Paper/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sand/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Midnight/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nord/ })).toBeInTheDocument();
  });

  it("renders the profile page", async () => {
    mockSignedIn();
    renderPath(paths.profile);
    expect(
      await screen.findByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
    expect(screen.getByText("ada@storage.app")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Ada Lovelace")).toBeInTheDocument();
    expect(screen.queryByLabelText("Current password")).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Settings" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /Reset password/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sign out" }),
    ).toBeInTheDocument();
  });

  it("renders the reset password page", async () => {
    mockSignedIn();
    renderPath(paths.password);
    expect(
      await screen.findByRole("heading", { name: "Reset password" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Current password")).toBeInTheDocument();
    expect(screen.getByLabelText("New password")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();
  });

  it("lists leftover roadmap work", async () => {
    mockSignedIn();
    renderPath(paths.roadmap);
    expect(
      await screen.findByRole("heading", { name: "Roadmap" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Repo setup: Prettier and Husky"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Full auth on local: OTP, Google, GitHub"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Verify that auth on production"),
    ).toBeInTheDocument();
    expect(screen.getByText("S3 on local")).toBeInTheDocument();
    expect(screen.getByText("S3 on production")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: /Repo setup: Prettier and Husky/,
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /Verify that auth on production/ }),
    ).not.toBeChecked();
  });

  it("switches Home between grid and list view", async () => {
    mockSignedIn();
    const user = userEvent.setup();
    renderPath(paths.home);
    await screen.findByRole("heading", { name: "Home" });
    const list = screen.getByRole("button", { name: "List view" });
    const grid = screen.getByRole("button", { name: "Grid view" });
    expect(grid).toHaveAttribute("aria-pressed", "true");
    await user.click(list);
    expect(list).toHaveAttribute("aria-pressed", "true");
    expect(grid).toHaveAttribute("aria-pressed", "false");
    const trashLinks = screen.getAllByRole("link", { name: "Trash" });
    expect(trashLinks.length).toBeGreaterThan(0);
    await user.click(trashLinks[0]!);
    expect(
      await screen.findByRole("heading", { name: "Trash" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "List view" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("sends the selected Home sort to the listing API", async () => {
    mockSignedIn();
    const user = userEvent.setup();
    renderPath(paths.home);
    await screen.findByRole("heading", { name: "Home" });
    const fetchMock = vi.mocked(fetch);
    expect(
      fetchMock.mock.calls.some((call) =>
        requestUrl(call[0]).includes("sortBy=name"),
      ),
    ).toBe(true);

    await user.click(screen.getByRole("button", { name: "Sort" }));
    await user.click(
      screen.getByRole("menuitemradio", { name: "Date modified" }),
    );
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some((call) =>
          requestUrl(call[0]).includes("sortBy=modified&sortDir=desc"),
        ),
      ).toBe(true);
    });

    await user.click(
      screen.getByRole("menuitemradio", { name: "Mixed with files" }),
    );
    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some((call) =>
          requestUrl(call[0]).includes("folders=mixed"),
        ),
      ).toBe(true);
    });
  });
});
