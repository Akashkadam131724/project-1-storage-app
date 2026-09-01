import { FileText, Folder } from "lucide-react";
import { Link } from "react-router";
import { fileContentPath } from "../../apis/files.ts";
import type { PublicFile, PublicFolder } from "../../apis/types.ts";
import { paths } from "../../utils/paths.ts";

type Props = {
  folders: PublicFolder[];
  files: PublicFile[];
  onTrashFolder?: (id: string) => void;
  onTrashFile?: (id: string) => void;
};

export function ItemGrid({
  folders,
  files,
  onTrashFolder,
  onTrashFile,
}: Props) {
  if (folders.length === 0 && files.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        This folder is empty
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} onTrash={onTrashFolder} />
      ))}
      {files.map((file) => (
        <FileCard key={file.id} file={file} onTrash={onTrashFile} />
      ))}
    </div>
  );
}

function FolderCard({
  folder,
  onTrash,
}: {
  folder: PublicFolder;
  onTrash?: (id: string) => void;
}) {
  return (
    <article className="group relative rounded-2xl border border-line bg-chrome/60 p-4 transition hover:shadow-raise">
      <Link to={paths.folder(folder.id)} className="block">
        <div className="mb-3 flex justify-center text-primary">
          <Folder className="size-14" />
        </div>
        <p className="truncate text-sm font-medium text-ink">{folder.name}</p>
      </Link>
      {onTrash ? (
        <button
          type="button"
          className="absolute right-2 top-2 hidden rounded-full bg-canvas px-2 py-1 text-xs text-muted group-hover:block hover:text-ink"
          onClick={() => onTrash(folder.id)}
        >
          Trash
        </button>
      ) : null}
    </article>
  );
}

function FileCard({
  file,
  onTrash,
}: {
  file: PublicFile;
  onTrash?: (id: string) => void;
}) {
  return (
    <article className="group relative rounded-2xl border border-line bg-chrome/60 p-4 transition hover:shadow-raise">
      <a href={fileContentPath(file.id)} className="block">
        <div className="mb-3 flex justify-center text-primary">
          <FileText className="size-14" />
        </div>
        <p className="truncate text-sm font-medium text-ink">{file.name}</p>
      </a>
      {onTrash ? (
        <button
          type="button"
          className="absolute right-2 top-2 hidden rounded-full bg-canvas px-2 py-1 text-xs text-muted group-hover:block hover:text-ink"
          onClick={() => onTrash(file.id)}
        >
          Trash
        </button>
      ) : null}
    </article>
  );
}
