import { createContext, useContext } from "react";
import type { ThemeId } from "./themes.ts";

export type ThemeContextValue = {
  theme: ThemeId;
  isDark: boolean;
  setTheme: (id: ThemeId) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return theme;
}
