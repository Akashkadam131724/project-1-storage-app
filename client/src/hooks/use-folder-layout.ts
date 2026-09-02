import { useState } from "react";

export type FolderLayout = "grid" | "list";

const layoutKey = "storage-layout";

export function readFolderLayout(): FolderLayout {
  return localStorage.getItem(layoutKey) === "list" ? "list" : "grid";
}

export function useFolderLayout() {
  const [layout, setLayout] = useState(readFolderLayout);

  function change(next: FolderLayout) {
    localStorage.setItem(layoutKey, next);
    setLayout(next);
  }

  return { layout, setLayout: change };
}
