export const themeIds = ["paper", "ocean", "sand", "midnight", "nord"] as const;

export type ThemeId = (typeof themeIds)[number];

export type ThemeOption = {
  id: ThemeId;
  name: string;
  isDark: boolean;
  chrome: string;
  canvas: string;
  primary: string;
};

export const themes: ThemeOption[] = [
  {
    id: "paper",
    name: "Paper",
    isDark: false,
    chrome: "#e9eef6",
    canvas: "#ffffff",
    primary: "#0b57d0",
  },
  {
    id: "ocean",
    name: "Ocean",
    isDark: false,
    chrome: "#e7f1f3",
    canvas: "#ffffff",
    primary: "#0f766e",
  },
  {
    id: "sand",
    name: "Sand",
    isDark: false,
    chrome: "#f3efe6",
    canvas: "#fffdf8",
    primary: "#b45309",
  },
  {
    id: "midnight",
    name: "Midnight",
    isDark: true,
    chrome: "#252525",
    canvas: "#1e1e1e",
    primary: "#8ab4f8",
  },
  {
    id: "nord",
    name: "Nord",
    isDark: true,
    chrome: "#1e242e",
    canvas: "#161b22",
    primary: "#7dd3fc",
  },
];

export const themesById = Object.fromEntries(
  themes.map((theme) => [theme.id, theme]),
) as Record<ThemeId, ThemeOption>;

export function isThemeId(value: string | null): value is ThemeId {
  return themeIds.includes(value as ThemeId);
}

export function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  const isDark = themesById[id].isDark;
  root.dataset.theme = id;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}
