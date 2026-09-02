import { LayoutGrid, List, Plus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { IconButton } from "../../components/ui/icon-button.tsx";
import { TextField } from "../../components/ui/text-field.tsx";
import type { ListingSort } from "../../apis/listing.ts";
import type { FolderLayout } from "../../hooks/use-folder-layout.ts";
import { SortMenu } from "./SortMenu.tsx";

export type { FolderLayout };

type Props = {
  busy: boolean;
  layout: FolderLayout;
  onLayoutChange: (layout: FolderLayout) => void;
  sort: ListingSort;
  onSortChange: (sort: ListingSort) => void;
  onCreate: (name: string) => void;
  onUpload: (files: File[]) => void;
};

export function Toolbar({
  busy,
  layout,
  onLayoutChange,
  sort,
  onSortChange,
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
        <Button
          variant="soft"
          className="hidden px-3 py-2 sm:flex"
          onClick={() => setCreating(true)}
        >
          <Plus className="size-4" />
          New
        </Button>
      )}
      <Button
        variant="outline"
        className="px-3 py-2"
        disabled={busy}
        onClick={() => fileInput.current?.click()}
      >
        <Upload className="size-4" />
        Upload
      </Button>
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
      <ListingControls
        layout={layout}
        onLayoutChange={onLayoutChange}
        sort={sort}
        onSortChange={onSortChange}
      />
    </div>
  );
}

export function ListingControls({
  layout,
  onLayoutChange,
  sort,
  onSortChange,
  showFolders = true,
}: {
  layout: FolderLayout;
  onLayoutChange: (layout: FolderLayout) => void;
  sort: ListingSort;
  onSortChange: (sort: ListingSort) => void;
  showFolders?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <SortMenu sort={sort} onChange={onSortChange} showFolders={showFolders} />
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
      <div className="w-36">
        <TextField
          autoFocus
          shape="pill"
          placeholder="Folder name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <Button type="submit" variant="link" disabled={busy}>
        Create
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
    </form>
  );
}
