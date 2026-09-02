import { useState, type MouseEvent } from "react";
import { MoreVertical } from "lucide-react";
import { fileDownloadPath } from "../../apis/files.ts";
import { placePopover, Popover } from "../../components/ui/popover.tsx";
import type {
  DriveActions,
  DriveMode,
  ItemKind,
} from "../../hooks/drive-types.ts";

type Props = {
  kind: ItemKind;
  id: string;
  name: string;
  starred: boolean;
  mode?: DriveMode;
  actions?: DriveActions;
};

type MenuBox = { top: number; left: number };

const MENU_WIDTH = 176;
const ROW_HEIGHT = 36;

export function ItemMenu({
  kind,
  id,
  name,
  starred,
  mode = "browse",
  actions,
}: Props) {
  const [box, setBox] = useState<MenuBox | null>(null);
  const items = actionItems({ kind, id, name, starred, mode, actions });
  if (items.length === 0) return null;

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    if (box) {
      setBox(null);
      return;
    }
    setBox(
      placePopover(event.currentTarget.getBoundingClientRect(), {
        width: MENU_WIDTH,
        height: items.length * ROW_HEIGHT + 8,
      }),
    );
  }

  return (
    <div
      className="relative shrink-0"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Item actions"
        aria-expanded={Boolean(box)}
        className="rounded-full p-1.5 text-muted hover:bg-chrome hover:text-ink"
        onClick={toggle}
      >
        <MoreVertical className="size-4" />
      </button>
      {box ? (
        <Popover box={box} onClose={() => setBox(null)}>
          {items.map((item) => (
            <MenuEntry
              key={item.label}
              item={item}
              onClose={() => setBox(null)}
            />
          ))}
        </Popover>
      ) : null}
    </div>
  );
}

type ActionItem = {
  label: string;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
};

function MenuEntry({
  item,
  onClose,
}: {
  item: ActionItem;
  onClose: () => void;
}) {
  const className = item.danger
    ? "block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-chrome"
    : "block w-full px-3 py-2 text-left text-sm text-ink hover:bg-chrome";

  if (item.href) {
    return (
      <a
        href={item.href}
        className={className}
        role="menuitem"
        onClick={onClose}
      >
        {item.label}
      </a>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      className={className}
      onClick={() => {
        item.onClick?.();
        onClose();
      }}
    >
      {item.label}
    </button>
  );
}

function actionItems(props: Props): ActionItem[] {
  if (!props.actions) return [];
  if (props.mode === "trash") return trashItems(props);
  return liveItems(props);
}

function trashItems({ kind, id, actions }: Props): ActionItem[] {
  return [
    {
      label: "Restore",
      onClick: () => actions?.onRestore?.(kind, id),
    },
    {
      label: "Delete forever",
      danger: true,
      onClick: () => actions?.onPurge?.(kind, id),
    },
  ];
}

function liveItems(props: Props): ActionItem[] {
  const { kind, id, name, starred, actions } = props;
  const items: ActionItem[] = [
    { label: "Rename", onClick: () => actions?.onRename?.(kind, id, name) },
    {
      label: starred ? "Unstar" : "Star",
      onClick: () => actions?.onStar?.(kind, id, !starred),
    },
    { label: "Move", onClick: () => actions?.onMove?.(kind, id) },
    { label: "Copy", onClick: () => actions?.onCopy?.(kind, id) },
  ];
  if (kind === "file") {
    items.push({ label: "Download", href: fileDownloadPath(id) });
  }
  items.push({
    label: "Trash",
    onClick: () => actions?.onTrash?.(kind, id),
  });
  return items;
}
