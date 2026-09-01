import type { LucideIcon } from "lucide-react";
import { Clock, Star, Trash2 } from "lucide-react";
import { PageCanvas } from "../shared/ui/page-canvas.tsx";

type Props = {
  title: string;
  icon: LucideIcon;
  message: string;
  hint: string;
};

function EmptyLibraryPage({ title, icon: Icon, message, hint }: Props) {
  return (
    <PageCanvas title={title}>
      <div className="py-20 text-center">
        <Icon className="mx-auto mb-4 size-20 text-subtle" />
        <p className="mb-2 text-lg text-muted">{message}</p>
        <p className="text-sm text-subtle">{hint}</p>
      </div>
    </PageCanvas>
  );
}

export function TrashPage() {
  return (
    <EmptyLibraryPage
      title="Trash"
      icon={Trash2}
      message="Trash is empty"
      hint="Deleted files will appear here"
    />
  );
}

export function StarredPage() {
  return (
    <EmptyLibraryPage
      title="Starred"
      icon={Star}
      message="No starred items"
      hint="Star files and folders to find them quickly"
    />
  );
}

export function RecentPage() {
  return (
    <EmptyLibraryPage
      title="Recent"
      icon={Clock}
      message="No recent files"
      hint="Files you open will show up here"
    />
  );
}
