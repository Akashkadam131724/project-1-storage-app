import { useState } from "react";
import { useDriveActions } from "./use-drive-actions.ts";
import type { DriveActions, ItemRef } from "./drive-types.ts";

export type PickerState = ItemRef & { mode: "move" | "copy" };
export type RenameState = ItemRef & { name: string };

export function useDriveWorkspace() {
  const api = useDriveActions();
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [rename, setRename] = useState<RenameState | null>(null);
  const [purge, setPurge] = useState<ItemRef | null>(null);

  const actions: DriveActions = {
    onRename: (kind, id, name) => setRename({ kind, id, name }),
    onStar: (kind, id, starred) => api.star.mutate({ kind, id, starred }),
    onMove: (kind, id) => setPicker({ kind, id, mode: "move" }),
    onCopy: (kind, id) => setPicker({ kind, id, mode: "copy" }),
    onTrash: (kind, id) => api.trash.mutate({ kind, id }),
    onRestore: (kind, id) => api.restore.mutate({ kind, id }),
    onPurge: (kind, id) => setPurge({ kind, id }),
  };

  function submitRename(name: string) {
    if (!rename) return;
    api.rename.mutate({ ...rename, name });
    setRename(null);
  }

  function submitPicker(parentId: string) {
    if (!picker) return;
    const input = { kind: picker.kind, id: picker.id, parentId };
    if (picker.mode === "move") api.move.mutate(input);
    else api.copy.mutate(input);
    setPicker(null);
  }

  function confirmPurge() {
    if (!purge) return;
    api.purge.mutate(purge);
    setPurge(null);
  }

  return {
    actions,
    picker,
    rename,
    purge,
    setPicker,
    setRename,
    setPurge,
    submitRename,
    submitPicker,
    confirmPurge,
  };
}

export type DriveWorkspace = ReturnType<typeof useDriveWorkspace>;
