import { Link, useParams } from "react-router";
import { useFolder } from "../../hooks/use-folder.ts";
import type { PublicFolder } from "../../apis/types.ts";
import { paths } from "../../utils/paths.ts";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { ItemGrid } from "./ItemGrid.tsx";
import { Toolbar } from "./Toolbar.tsx";

export function DirectoryPage() {
  const { folderId } = useParams();
  const folder = useFolder(folderId);
  const data = folder.listing.data;
  const title = data?.folder.isRoot ? "Home" : (data?.folder.name ?? "Home");
  const busy = folder.create.isPending || folder.upload.isPending;

  return (
    <PageCanvas
      title={title}
      actions={
        <Toolbar
          busy={busy}
          onCreate={(name) => folder.create.mutate(name)}
          onUpload={(files) => folder.upload.mutate(files)}
        />
      }
    >
      {data ? (
        <FolderTrail ancestors={data.ancestors} current={data.folder} />
      ) : null}
      {folder.listing.isPending ? (
        <p className="py-16 text-center text-sm text-muted">Loading…</p>
      ) : null}
      {folder.listing.isError ? (
        <p className="py-16 text-center text-sm text-muted">
          Could not load this folder
        </p>
      ) : null}
      {data ? (
        <ItemGrid
          folders={data.folders.items}
          files={data.files.items}
          onTrashFolder={(id) => folder.removeFolder.mutate(id)}
          onTrashFile={(id) => folder.removeFile.mutate(id)}
        />
      ) : null}
    </PageCanvas>
  );
}

function FolderTrail({
  ancestors,
  current,
}: {
  ancestors: PublicFolder[];
  current: PublicFolder;
}) {
  if (current.isRoot) return null;

  return (
    <nav className="mb-4 flex flex-wrap gap-1 text-sm text-muted">
      <Link className="hover:text-ink" to={paths.home}>
        Home
      </Link>
      {ancestors
        .filter((folder) => !folder.isRoot)
        .map((folder) => (
          <span key={folder.id} className="flex gap-1">
            <span>/</span>
            <Link className="hover:text-ink" to={paths.folder(folder.id)}>
              {folder.name}
            </Link>
          </span>
        ))}
      <span className="flex gap-1 text-ink">
        <span>/</span>
        <span>{current.name}</span>
      </span>
    </nav>
  );
}
