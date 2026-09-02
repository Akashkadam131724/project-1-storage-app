import { useLocalPref } from "./use-local-pref.ts";

export type FolderLayout = "grid" | "list";

const layoutKey = "storage-layout";

export function readFolderLayout(): FolderLayout {
  return localStorage.getItem(layoutKey) === "list" ? "list" : "grid";
}

export function useFolderLayout() {
  const [layout, setLayout] = useLocalPref(readFolderLayout, (next) =>
    localStorage.setItem(layoutKey, next),
  );

  return { layout, setLayout };
}
