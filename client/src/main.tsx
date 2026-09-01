import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AppProviders } from "./routes/providers.tsx";
import { createAppRouter } from "./routes/index.ts";
import "./styles/index.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}

const router = createAppRouter();

createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
