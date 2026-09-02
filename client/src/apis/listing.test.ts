import { describe, expect, it } from "vitest";
import {
  DEFAULT_LISTING_SORT,
  listingSortForField,
  listQuery,
  nextListingPage,
  parseListingSort,
  toDriveItems,
  toggleListingDir,
} from "./listing.ts";

describe("listing query", () => {
  it("sends page, limit, and sort params", () => {
    expect(listQuery(2)).toBe(
      "page=2&limit=50&sortBy=name&sortDir=asc&folders=top",
    );
    expect(
      listQuery(1, {
        sortBy: "modified",
        sortDir: "desc",
        folders: "mixed",
      }),
    ).toBe("page=1&limit=50&sortBy=modified&sortDir=desc&folders=mixed");
  });

  it("falls back to defaults for unknown stored sort values", () => {
    expect(parseListingSort({ sortBy: "shared", folders: "beside" })).toEqual(
      DEFAULT_LISTING_SORT,
    );
  });

  it("resets direction when the sort field changes", () => {
    const current = listingSortForField(DEFAULT_LISTING_SORT, "modified");
    expect(current).toEqual({
      sortBy: "modified",
      sortDir: "desc",
      folders: "top",
    });
    expect(toggleListingDir(current).sortDir).toBe("asc");
  });

  it("pages mixed entries instead of the split folder and file lists", () => {
    const folders = { items: [], page: 1, limit: 2, total: 1, totalPages: 1 };
    const files = { items: [], page: 1, limit: 2, total: 3, totalPages: 2 };
    const entries = { items: [], page: 1, limit: 2, total: 4, totalPages: 2 };
    expect(nextListingPage(folders, files, entries)).toBe(2);
    expect(nextListingPage(folders, files)).toBe(2);
  });

  it("maps mixed API entries into drive items", () => {
    const folder = {
      id: "f1",
      name: "Docs",
      parentId: "root",
      size: 0,
      isRoot: false,
      isStarred: false,
      isTrashed: false,
      createdAt: "",
      updatedAt: "",
    };
    const file = {
      id: "a1",
      name: "notes.txt",
      parentId: "root",
      size: 4,
      mimeType: "text/plain",
      isStarred: false,
      isTrashed: false,
      lastOpenedAt: null,
      createdAt: "",
      updatedAt: "",
    };
    expect(
      toDriveItems([
        { type: "file", file },
        { type: "folder", folder },
      ]),
    ).toEqual([
      { kind: "file", file },
      { kind: "folder", folder },
    ]);
  });
});
