import { useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext } from "./theme-context.ts";
import { applyTheme, isThemeId, themesById, type ThemeId } from "./themes.ts";

const storageKey = "storage-theme";

function readStoredTheme(): ThemeId {
  const stored = localStorage.getItem(storageKey);
  if (stored === "dark") return "midnight";
  if (stored === "light") return "ocean";
  if (isThemeId(stored)) return stored;
  return "ocean";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState(readStoredTheme);

  useLayoutEffect(() => {
    localStorage.setItem(storageKey, theme);
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: themesById[theme].isDark,
      setTheme,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
