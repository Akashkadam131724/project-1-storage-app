import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { Download } from "lucide-react";
import {
  fileContentPath,
  fileDownloadPath,
  getFile,
} from "../../apis/files.ts";
import type { PublicFile } from "../../apis/types.ts";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { StatusMessage } from "../../components/ui/status-message.tsx";
import { ButtonAnchor } from "../../components/ui/button.tsx";
import {
  useDriveWorkspace,
  type DriveWorkspace,
} from "../../hooks/use-drive-workspace.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import { formatBytes, formatDate } from "../../utils/format.ts";
import { folderOrHome, paths } from "../../utils/paths.ts";
import { DriveDialogs } from "../DirectoryPage/DriveDialogs.tsx";
import { ItemMenu } from "../DirectoryPage/ItemMenu.tsx";

export function FilePage() {
  const { fileId } = useParams();
  const { user } = useAuth();
  const workspace = useDriveWorkspace();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["file", fileId],
    queryFn: async () => {
      const file = await getFile(fileId ?? "");
      await queryClient.invalidateQueries({ queryKey: ["recent"] });
      return file;
    },
    enabled: Boolean(fileId),
  });
  const file = query.data;
  const backTo = file
    ? folderOrHome(file.parentId, user?.rootDirId)
    : paths.home;

  return (
    <>
      <PageCanvas
        title={file?.name ?? "File"}
        backTo={backTo}
        actions={
          file ? <FileActions file={file} workspace={workspace} /> : null
        }
      >
        {query.isPending ? <StatusMessage>Loading…</StatusMessage> : null}
        {query.isError ? (
          <StatusMessage>Could not load this file</StatusMessage>
        ) : null}
        {file ? <FileBody file={file} /> : null}
      </PageCanvas>
      <DriveDialogs workspace={workspace} />
    </>
  );
}

function FileActions({
  file,
  workspace,
}: {
  file: PublicFile;
  workspace: DriveWorkspace;
}) {
  return (
    <div className="flex items-center gap-2">
      <ButtonAnchor
        href={fileDownloadPath(file.id)}
        variant="outline"
        className="px-3 py-2"
      >
        <Download className="size-4" />
        Download
      </ButtonAnchor>
      <ItemMenu
        kind="file"
        id={file.id}
        name={file.name}
        starred={file.isStarred}
        actions={workspace.actions}
      />
    </div>
  );
}

function FileBody({ file }: { file: PublicFile }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        {formatBytes(file.size)}
        <span className="px-2">·</span>
        {formatDate(file.updatedAt)}
      </p>
      <FilePreview file={file} />
    </div>
  );
}

function FilePreview({ file }: { file: PublicFile }) {
  const url = fileContentPath(file.id);
  if (file.mimeType.startsWith("image/")) {
    return (
      <img
        src={url}
        alt={file.name}
        className="max-h-[70vh] max-w-full rounded-xl border border-line"
      />
    );
  }
  if (file.mimeType.startsWith("video/")) {
    return (
      <video src={url} controls className="max-h-[70vh] w-full rounded-xl" />
    );
  }
  if (file.mimeType.startsWith("audio/")) {
    return <audio src={url} controls className="w-full" />;
  }
  if (isPdf(file)) {
    return <PdfFrame fileId={file.id} title={file.name} />;
  }
  return (
    <p className="rounded-2xl border border-line bg-chrome/60 p-8 text-sm text-muted">
      Preview is not available for this file type. Use Download to open it.
    </p>
  );
}

function isPdf(file: PublicFile) {
  return (
    file.mimeType === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

function PdfFrame({ fileId, title }: { fileId: string; title: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    void fetch(fileContentPath(fileId), { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load PDF");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        objectUrl = URL.createObjectURL(
          new Blob([buffer], { type: "application/pdf" }),
        );
        if (!active) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setUrl(objectUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (failed) {
    return (
      <p className="rounded-2xl border border-line bg-chrome/60 p-8 text-sm text-muted">
        Could not preview this PDF. Use Download to open it.
      </p>
    );
  }
  if (!url) {
    return <StatusMessage>Loading preview…</StatusMessage>;
  }
  return (
    <iframe
      title={title}
      src={url}
      className="h-[70vh] w-full rounded-xl border border-line bg-canvas"
    />
  );
}
