import { LayoutGrid, List, Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { IconButton } from "../../components/ui/icon-button.tsx";
import type { FolderLayout } from "../../hooks/use-folder-layout.ts";

export type { FolderLayout };

type Props = {
  busy: boolean;
  layout: FolderLayout;
  onLayoutChange: (layout: FolderLayout) => void;
  onCreate: (name: string) => void;
  onUpload: (files: File[]) => void;
};

export function Toolbar({
  busy,
  layout,
  onLayoutChange,
  onCreate,
  onUpload,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {creating ? (
        <CreateField
          busy={busy}
          onCancel={() => setCreating(false)}
          onCreate={(name) => {
            onCreate(name);
            setCreating(false);
          }}
        />
      ) : (
        <button
          type="button"
          className="hidden items-center gap-2 rounded-full bg-primary-container px-3 py-2 text-sm font-medium text-on-primary-container sm:flex"
          onClick={() => setCreating(true)}
        >
          <Plus className="size-4" />
          New
        </button>
      )}
      <button
        type="button"
        className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink hover:bg-chrome"
        disabled={busy}
        onClick={() => fileInput.current?.click()}
      >
        <Upload className="size-4" />
        Upload
      </button>
      <input
        ref={fileInput}
        type="file"
        className="hidden"
        multiple
        onChange={(event) => {
          const selected = event.target.files;
          if (!selected?.length) return;
          onUpload(Array.from(selected));
          event.target.value = "";
        }}
      />
      <LayoutToggle layout={layout} onLayoutChange={onLayoutChange} />
    </div>
  );
}

export function LayoutToggle({
  layout,
  onLayoutChange,
}: {
  layout: FolderLayout;
  onLayoutChange: (layout: FolderLayout) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <IconButton
        label="Grid view"
        pressed={layout === "grid"}
        onClick={() => onLayoutChange("grid")}
      >
        <LayoutGrid className="size-5" />
      </IconButton>
      <IconButton
        label="List view"
        pressed={layout === "list"}
        onClick={() => onLayoutChange("list")}
      >
        <List className="size-5" />
      </IconButton>
    </div>
  );
}

function CreateField({
  busy,
  onCancel,
  onCreate,
}: {
  busy: boolean;
  onCancel: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState("");

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const next = name.trim();
        if (next) onCreate(next);
      }}
    >
      <input
        autoFocus
        className="w-36 rounded-full border border-line bg-search px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
        placeholder="Folder name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button
        type="submit"
        className="text-sm font-medium text-primary"
        disabled={busy}
      >
        Create
      </button>
      <button type="button" className="text-sm text-muted" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
