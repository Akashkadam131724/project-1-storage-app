import { describe, expect, it } from "vitest";
import { isThemeId, themeIds, themes } from "./themes.ts";

describe("themes", () => {
  it("exposes five named palettes including a dark theme", () => {
    expect(themeIds).toHaveLength(5);
    expect(themes.some((theme) => theme.isDark)).toBe(true);
    expect(themes.some((theme) => !theme.isDark)).toBe(true);
  });

  it("accepts known theme ids and rejects others", () => {
    expect(isThemeId("ocean")).toBe(true);
    expect(isThemeId("paper")).toBe(true);
    expect(isThemeId("nord")).toBe(true);
    expect(isThemeId("dark")).toBe(false);
  });

  it("lists Ocean first as the default palette", () => {
    expect(themeIds[0]).toBe("ocean");
    expect(themes[0]?.id).toBe("ocean");
  });
});
