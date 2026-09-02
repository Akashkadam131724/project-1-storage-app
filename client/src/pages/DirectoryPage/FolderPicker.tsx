import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Folder } from "lucide-react";
import { getFolder } from "../../apis/directories.ts";
import { Button } from "../../components/ui/button.tsx";
import { DialogActions } from "../../components/ui/dialog-actions.tsx";
import { FolderTrail } from "../../components/ui/folder-trail.tsx";
import { Modal } from "../../components/ui/modal.tsx";

type Props = {
  open: boolean;
  title: string;
  excludeId?: string;
  onClose: () => void;
  onPick: (parentId: string) => void;
};

export function FolderPicker({
  open,
  title,
  excludeId,
  onClose,
  onPick,
}: Props) {
  const [folderId, setFolderId] = useState<string | undefined>();
  const listing = useQuery({
    queryKey: ["folder-picker", folderId ?? "root"],
    queryFn: () => getFolder(folderId),
    enabled: open,
  });

  const data = listing.data;
  const here = data?.folder.id;
  const canPick = Boolean(here) && here !== excludeId;

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {data ? (
        <FolderTrail
          ancestors={data.ancestors}
          current={data.folder}
          onOpen={setFolderId}
        />
      ) : null}
      <div className="max-h-64 overflow-y-auto rounded-xl border border-line">
        {listing.isPending ? (
          <p className="p-4 text-sm text-muted">Loading…</p>
        ) : (
          <PickerFolders
            folders={data?.folders.items ?? []}
            excludeId={excludeId}
            onOpen={setFolderId}
          />
        )}
      </div>
      <DialogActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={!canPick}
          onClick={() => {
            if (here) onPick(here);
          }}
        >
          {title}
        </Button>
      </DialogActions>
    </Modal>
  );
}

function PickerFolders({
  folders,
  excludeId,
  onOpen,
}: {
  folders: { id: string; name: string }[];
  excludeId?: string;
  onOpen: (id: string) => void;
}) {
  const visible = folders.filter((folder) => folder.id !== excludeId);
  if (visible.length === 0) {
    return <p className="p-4 text-sm text-muted">No folders here</p>;
  }
  return (
    <ul>
      {visible.map((folder) => (
        <li key={folder.id}>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-chrome"
            onClick={() => onOpen(folder.id)}
          >
            <Folder className="size-4 text-primary" />
            {folder.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
