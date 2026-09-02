import type { ReactNode } from "react";
import {
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  Star,
} from "lucide-react";
import { Link } from "react-router";
import type { PublicFile, PublicFolder } from "../../apis/types.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import type { DriveActions, DriveMode } from "../../hooks/drive-types.ts";
import {
  formatBytes,
  formatDate,
  formatShortDate,
} from "../../utils/format.ts";
import { paths } from "../../utils/paths.ts";
import { ItemMenu } from "./ItemMenu.tsx";
import type { FolderLayout } from "./Toolbar.tsx";

type Props = {
  folders: PublicFolder[];
  files: PublicFile[];
  layout?: FolderLayout;
  mode?: DriveMode;
  actions?: DriveActions;
};

export function ItemGrid({
  folders,
  files,
  layout = "grid",
  mode = "browse",
  actions,
}: Props) {
  if (folders.length === 0 && files.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        This folder is empty
      </p>
    );
  }

  const shared = { mode, actions };
  if (layout === "list") {
    return <ItemList folders={folders} files={files} {...shared} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} {...shared} />
      ))}
      {files.map((file) => (
        <FileCard key={file.id} file={file} {...shared} />
      ))}
    </div>
  );
}

function ItemList({ folders, files, mode, actions }: Omit<Props, "layout">) {
  return (
    <div className="lg:rounded-2xl lg:border lg:border-line">
      <ListHeader />
      <div className="divide-y divide-line overflow-hidden">
        {folders.map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            mode={mode}
            actions={actions}
          />
        ))}
        {files.map((file) => (
          <FileRow key={file.id} file={file} mode={mode} actions={actions} />
        ))}
      </div>
    </div>
  );
}

function ListHeader() {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-[1fr_2.5rem] gap-3 border-b border-line bg-canvas px-4 py-2 text-xs font-medium text-muted sm:grid-cols-[1fr_6rem_9rem_2.5rem] lg:rounded-t-2xl">
      <span>Name</span>
      <span className="hidden sm:block">Size</span>
      <span className="hidden sm:block">Modified</span>
      <span className="sr-only">Actions</span>
    </div>
  );
}

function FolderCard({
  folder,
  mode,
  actions,
}: {
  folder: PublicFolder;
  mode?: DriveMode;
  actions?: DriveActions;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-canvas p-3 transition hover:shadow-raise">
      <div className="flex items-center gap-2">
        <FolderOpen
          folder={folder}
          mode={mode}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <TypeBadge label="FOLDER" tone="folder" />
          <NameLabel name={folder.name} starred={folder.isStarred} />
        </FolderOpen>
        <ItemMenu
          kind="folder"
          id={folder.id}
          name={folder.name}
          starred={folder.isStarred}
          mode={mode}
          actions={actions}
        />
      </div>
      <FolderOpen
        folder={folder}
        mode={mode}
        className="mt-3 block"
        label={folder.name}
      >
        <IconWell>
          <Folder className="size-16 text-primary" />
        </IconWell>
      </FolderOpen>
      <CardMeta verb="created" at={folder.createdAt} />
    </article>
  );
}

function FileCard({
  file,
  mode,
  actions,
}: {
  file: PublicFile;
  mode?: DriveMode;
  actions?: DriveActions;
}) {
  const kind = fileKind(file.name, file.mimeType);
  return (
    <article className="flex flex-col rounded-2xl border border-line bg-canvas p-3 transition hover:shadow-raise">
      <div className="flex items-center gap-2">
        <FileOpen
          file={file}
          mode={mode}
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <TypeBadge label={kind.label} tone={kind.tone} />
          <NameLabel name={file.name} starred={file.isStarred} />
        </FileOpen>
        <ItemMenu
          kind="file"
          id={file.id}
          name={file.name}
          starred={file.isStarred}
          mode={mode}
          actions={actions}
        />
      </div>
      <FileOpen
        file={file}
        mode={mode}
        className="mt-3 block"
        label={file.name}
      >
        <IconWell>
          <kind.icon className="size-16 text-primary" />
        </IconWell>
      </FileOpen>
      <CardMeta verb="uploaded" at={file.createdAt} />
    </article>
  );
}

function FolderRow({
  folder,
  mode,
  actions,
}: {
  folder: PublicFolder;
  mode?: DriveMode;
  actions?: DriveActions;
}) {
  return (
    <div className="group flex items-center gap-3 py-3 pl-4 pr-5 hover:bg-chrome">
      <FolderOpen
        folder={folder}
        mode={mode}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Folder className="size-8 shrink-0 text-primary" />
        <NameLabel name={folder.name} starred={folder.isStarred} />
      </FolderOpen>
      <Meta size={folder.size} updatedAt={folder.updatedAt} />
      <ItemMenu
        kind="folder"
        id={folder.id}
        name={folder.name}
        starred={folder.isStarred}
        mode={mode}
        actions={actions}
      />
    </div>
  );
}

function FileRow({
  file,
  mode,
  actions,
}: {
  file: PublicFile;
  mode?: DriveMode;
  actions?: DriveActions;
}) {
  const kind = fileKind(file.name, file.mimeType);
  return (
    <div className="group flex items-center gap-3 py-3 pl-4 pr-5 hover:bg-chrome">
      <FileOpen
        file={file}
        mode={mode}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <kind.icon className="size-8 shrink-0 text-primary" />
        <NameLabel name={file.name} starred={file.isStarred} />
      </FileOpen>
      <Meta size={file.size} updatedAt={file.updatedAt} />
      <ItemMenu
        kind="file"
        id={file.id}
        name={file.name}
        starred={file.isStarred}
        mode={mode}
        actions={actions}
      />
    </div>
  );
}

function FolderOpen({
  folder,
  mode,
  className,
  label,
  children,
}: {
  folder: PublicFolder;
  mode?: DriveMode;
  className: string;
  label?: string;
  children: ReactNode;
}) {
  if (mode === "trash") {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link to={paths.folder(folder.id)} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

function FileOpen({
  file,
  mode,
  className,
  label,
  children,
}: {
  file: PublicFile;
  mode?: DriveMode;
  className: string;
  label?: string;
  children: ReactNode;
}) {
  if (mode === "trash") {
    return <div className={className}>{children}</div>;
  }
  return (
    <Link to={paths.file(file.id)} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

function NameLabel({ name, starred }: { name: string; starred: boolean }) {
  return (
    <p className="flex min-w-0 items-center gap-1 truncate text-sm font-medium text-ink">
      <span className="truncate">{name}</span>
      {starred ? (
        <Star className="size-3.5 shrink-0 fill-primary text-primary" />
      ) : null}
    </p>
  );
}

function IconWell({ children }: { children: ReactNode }) {
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-chrome">
      {children}
    </div>
  );
}

function TypeBadge({ label, tone }: { label: string; tone: FileTone }) {
  return (
    <span
      className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white ${toneClass[tone]}`}
    >
      {label}
    </span>
  );
}

function CardMeta({ verb, at }: { verb: "uploaded" | "created"; at: string }) {
  const { user } = useAuth();
  const name = user?.name ?? "You";
  return (
    <div className="mt-3 flex min-w-0 items-center gap-2">
      <OwnerMark name={name} picture={user?.picture} />
      <p className="truncate text-xs text-muted">
        You {verb} · {formatShortDate(at)}
      </p>
    </div>
  );
}

function OwnerMark({ name, picture }: { name: string; picture?: string }) {
  if (picture) {
    return (
      <img
        src={picture}
        alt=""
        className="size-6 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-on-primary">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function Meta({ size, updatedAt }: { size: number; updatedAt: string }) {
  return (
    <>
      <span className="hidden w-24 shrink-0 text-xs text-muted sm:block">
        {formatBytes(size)}
      </span>
      <span className="hidden w-36 shrink-0 text-xs text-muted sm:block">
        {formatDate(updatedAt)}
      </span>
    </>
  );
}

type FileTone =
  "pdf" | "image" | "video" | "audio" | "archive" | "file" | "folder";

const toneClass: Record<FileTone, string> = {
  pdf: "bg-red-500",
  image: "bg-sky-600",
  video: "bg-violet-600",
  audio: "bg-amber-600",
  archive: "bg-orange-600",
  file: "bg-slate-500",
  folder: "bg-primary",
};

type FileKind = {
  label: string;
  tone: FileTone;
  icon: typeof FileText;
};

const kindMatchers: Array<{
  match: (ext: string, mime: string) => boolean;
  kind: (ext: string) => FileKind;
}> = [
  {
    match: (ext, mime) => mime === "application/pdf" || ext === "PDF",
    kind: () => ({ label: "PDF", tone: "pdf", icon: FileText }),
  },
  {
    match: (ext, mime) =>
      mime.startsWith("image/") ||
      ["PNG", "JPG", "JPEG", "GIF", "WEBP", "SVG"].includes(ext),
    kind: (ext) => ({ label: ext || "IMG", tone: "image", icon: FileImage }),
  },
  {
    match: (ext, mime) =>
      mime.startsWith("video/") || ["MP4", "MOV", "WEBM", "MKV"].includes(ext),
    kind: (ext) => ({ label: ext || "VID", tone: "video", icon: FileVideo }),
  },
  {
    match: (ext, mime) =>
      mime.startsWith("audio/") || ["MP3", "WAV", "M4A", "AAC"].includes(ext),
    kind: (ext) => ({ label: ext || "AUD", tone: "audio", icon: FileAudio }),
  },
  {
    match: (ext, mime) =>
      mime.includes("zip") ||
      mime.includes("compressed") ||
      ["ZIP", "RAR", "7Z", "TAR", "GZ"].includes(ext),
    kind: (ext) => ({
      label: ext || "ZIP",
      tone: "archive",
      icon: FileArchive,
    }),
  },
];

function fileKind(name: string, mimeType: string): FileKind {
  const ext = extension(name);
  const match = kindMatchers.find((entry) => entry.match(ext, mimeType));
  return (
    match?.kind(ext) ?? { label: ext || "FILE", tone: "file", icon: FileText }
  );
}

function extension(name: string) {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return "";
  return name.slice(dot + 1).toUpperCase();
}
