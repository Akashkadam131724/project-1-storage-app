import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { paths } from "./paths.ts";
import { createQueryClient } from "./query-client.ts";
import { routes } from "./router.ts";
import { ThemeProvider } from "../shared/theme/theme-provider.tsx";

function renderPath(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <ThemeProvider>
      <QueryClientProvider client={createQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe("app routes", () => {
  it("renders the Drive-like Home canvas", () => {
    renderPath(paths.home);
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search in Storage"),
    ).toBeInTheDocument();
    expect(screen.getByText("Docs")).toBeInTheDocument();
  });

  it("renders the sign-in page", () => {
    renderPath(paths.login);
    expect(
      screen.getByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
  });

  it("renders a not-found page", () => {
    renderPath("/does-not-exist");
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
  });

  it("renders the trash empty state", () => {
    renderPath(paths.trash);
    expect(screen.getByRole("heading", { name: "Trash" })).toBeInTheDocument();
    expect(screen.getByText("Trash is empty")).toBeInTheDocument();
  });

  it("lists five appearance themes", async () => {
    const user = userEvent.setup();
    renderPath(paths.home);
    await user.click(screen.getByRole("button", { name: "Choose theme" }));
    expect(screen.getByRole("button", { name: "Paper" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ocean" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sand" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Midnight" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nord" })).toBeInTheDocument();
  });
});
