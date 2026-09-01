import { FileText, Folder, LayoutGrid, List, Plus, Upload } from "lucide-react";
import { PageCanvas } from "../shared/ui/page-canvas.tsx";

const previewItems = [
  { id: "1", name: "Docs", kind: "folder" as const },
  { id: "2", name: "Photos", kind: "folder" as const },
  { id: "3", name: "notes.txt", kind: "file" as const },
  { id: "4", name: "resume.pdf", kind: "file" as const },
];

export function HomePage() {
  return (
    <PageCanvas title="Home" actions={<HomeActions />}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {previewItems.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-line bg-chrome/60 p-4 transition hover:shadow-raise"
          >
            <div className="mb-3 flex justify-center text-primary">
              {item.kind === "folder" ? (
                <Folder className="size-14" />
              ) : (
                <FileText className="size-14" />
              )}
            </div>
            <p className="truncate text-sm font-medium text-ink">{item.name}</p>
          </article>
        ))}
      </div>
    </PageCanvas>
  );
}

function HomeActions() {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="hidden items-center gap-2 rounded-full bg-primary-container px-3 py-2 text-sm font-medium text-on-primary-container sm:flex"
      >
        <Plus className="size-4" />
        New
      </button>
      <button
        type="button"
        className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink hover:bg-chrome sm:flex"
      >
        <Upload className="size-4" />
        Upload
      </button>
      <span className="hidden text-muted sm:flex">
        <LayoutGrid className="size-5" />
      </span>
      <span className="hidden text-muted sm:flex">
        <List className="size-5" />
      </span>
    </div>
  );
}
