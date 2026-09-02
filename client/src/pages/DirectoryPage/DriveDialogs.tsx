import { useState } from "react";
import { Modal } from "../../components/ui/modal.tsx";
import type { DriveWorkspace } from "../../hooks/use-drive-workspace.ts";
import { FolderPicker } from "./FolderPicker.tsx";

export function DriveDialogs({ workspace }: { workspace: DriveWorkspace }) {
  return (
    <>
      <RenameDialog
        key={workspace.rename?.id ?? "closed"}
        open={Boolean(workspace.rename)}
        name={workspace.rename?.name ?? ""}
        onClose={() => workspace.setRename(null)}
        onSubmit={workspace.submitRename}
      />
      <FolderPicker
        key={
          workspace.picker
            ? `${workspace.picker.mode}-${workspace.picker.id}`
            : "closed"
        }
        open={Boolean(workspace.picker)}
        title={workspace.picker?.mode === "copy" ? "Copy here" : "Move here"}
        excludeId={
          workspace.picker?.kind === "folder" ? workspace.picker.id : undefined
        }
        onClose={() => workspace.setPicker(null)}
        onPick={workspace.submitPicker}
      />
      <PurgeDialog
        open={Boolean(workspace.purge)}
        onClose={() => workspace.setPurge(null)}
        onConfirm={workspace.confirmPurge}
      />
    </>
  );
}

function RenameDialog({
  open,
  name,
  onClose,
  onSubmit,
}: {
  open: boolean;
  name: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [value, setValue] = useState(name);

  return (
    <Modal open={open} title="Rename" onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const next = value.trim();
          if (next) onSubmit(next);
        }}
      >
        <input
          autoFocus
          className="w-full rounded-lg border border-line bg-search px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="text-sm text-muted"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-on-primary"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PurgeDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} title="Delete forever?" onClose={onClose}>
      <p className="text-sm text-muted">This cannot be undone.</p>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="text-sm text-muted" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-medium text-white"
          onClick={onConfirm}
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}
