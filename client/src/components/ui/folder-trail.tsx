import { Link } from "react-router";
import { paths } from "../../utils/paths.ts";

export type TrailFolder = {
  id: string;
  name: string;
  isRoot: boolean;
};

export function FolderTrail({
  ancestors,
  current,
  onOpen,
}: {
  ancestors: TrailFolder[];
  current: TrailFolder;
  onOpen?: (id: string | undefined) => void;
}) {
  if (!onOpen && current.isRoot) return null;

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
      <TrailCrumb name="Home" isRoot onOpen={onOpen} />
      {ancestors
        .filter((folder) => !folder.isRoot)
        .map((folder) => (
          <span key={folder.id} className="flex gap-1">
            <span>/</span>
            <TrailCrumb id={folder.id} name={folder.name} onOpen={onOpen} />
          </span>
        ))}
      {current.isRoot ? null : (
        <span className="flex gap-1 text-ink">
          <span>/</span>
          <span>{current.name}</span>
        </span>
      )}
    </nav>
  );
}

function TrailCrumb({
  id,
  name,
  isRoot = false,
  onOpen,
}: {
  id?: string;
  name: string;
  isRoot?: boolean;
  onOpen?: (id: string | undefined) => void;
}) {
  if (onOpen) {
    return (
      <button
        type="button"
        className="hover:text-ink"
        onClick={() => onOpen(isRoot ? undefined : id)}
      >
        {name}
      </button>
    );
  }

  return (
    <Link
      className="hover:text-ink"
      to={isRoot || !id ? paths.home : paths.folder(id)}
    >
      {name}
    </Link>
  );
}
