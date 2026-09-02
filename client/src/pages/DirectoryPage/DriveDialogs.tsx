import { useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { DialogActions } from "../../components/ui/dialog-actions.tsx";
import { Modal } from "../../components/ui/modal.tsx";
import { TextField } from "../../components/ui/text-field.tsx";
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
        <TextField
          autoFocus
          className="px-3 py-2"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <DialogActions>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </DialogActions>
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
      <DialogActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Modal>
  );
}
