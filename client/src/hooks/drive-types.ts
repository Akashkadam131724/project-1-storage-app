export type ItemKind = "file" | "folder";

export type DriveMode = "browse" | "trash" | "starred" | "recent";

export type ItemRef = {
  kind: ItemKind;
  id: string;
};

export type DriveActions = {
  onRename?: (kind: ItemKind, id: string, name: string) => void;
  onStar?: (kind: ItemKind, id: string, starred: boolean) => void;
  onMove?: (kind: ItemKind, id: string) => void;
  onCopy?: (kind: ItemKind, id: string) => void;
  onTrash?: (kind: ItemKind, id: string) => void;
  onRestore?: (kind: ItemKind, id: string) => void;
  onPurge?: (kind: ItemKind, id: string) => void;
};
