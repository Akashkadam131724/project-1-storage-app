import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, Check } from "lucide-react";
import {
  listingSortForField,
  type FolderPlacement,
  type ListingSort,
  type SortBy,
  type SortDir,
} from "../../apis/listing.ts";

type Props = {
  sort: ListingSort;
  onChange: (sort: ListingSort) => void;
  showFolders?: boolean;
};

type MenuBox = { top: number; left: number };

const SORT_FIELDS: Array<{ value: SortBy; label: string }> = [
  { value: "name", label: "Name" },
  { value: "modified", label: "Date modified" },
  { value: "opened", label: "Date opened by me" },
];

export function SortMenu({ sort, onChange, showFolders = true }: Props) {
  const [box, setBox] = useState<MenuBox | null>(null);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    if (box) {
      setBox(null);
      return;
    }
    setBox(menuBox(event.currentTarget.getBoundingClientRect(), showFolders));
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        aria-label="Sort"
        aria-expanded={Boolean(box)}
        title="Sort"
        onClick={toggle}
        className={[
          "flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
          box
            ? "bg-primary-container text-on-primary-container"
            : "text-ink hover:bg-chrome",
        ].join(" ")}
      >
        <ArrowUpDown className="size-4" />
        <span className="hidden sm:inline">Sort</span>
      </button>
      {box ? (
        <SortPanel
          sort={sort}
          box={box}
          showFolders={showFolders}
          onChange={onChange}
          onClose={() => setBox(null)}
        />
      ) : null}
    </div>
  );
}

function SortPanel({
  sort,
  box,
  showFolders,
  onChange,
  onClose,
}: {
  sort: ListingSort;
  box: MenuBox;
  showFolders: boolean;
  onChange: (sort: ListingSort) => void;
  onClose: () => void;
}) {
  useCloseOnMove(onClose);
  const directions = directionOptions(sort.sortBy);

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close sort menu"
        className="fixed inset-0 z-50 cursor-default"
        onClick={onClose}
      />
      <div
        role="menu"
        aria-label="Sort"
        className="fixed z-50 w-56 rounded-xl border border-line bg-canvas py-1 shadow-raise"
        style={{ top: box.top, left: box.left }}
      >
        <Section title="Sort by">
          {SORT_FIELDS.map((field) => (
            <Choice
              key={field.value}
              label={field.label}
              selected={sort.sortBy === field.value}
              onSelect={() => onChange(listingSortForField(sort, field.value))}
            />
          ))}
        </Section>
        <Divider />
        <Section title="Sort direction">
          {directions.map((option) => (
            <Choice
              key={option.value}
              label={option.label}
              selected={sort.sortDir === option.value}
              onSelect={() => onChange({ ...sort, sortDir: option.value })}
            />
          ))}
        </Section>
        {showFolders ? (
          <>
            <Divider />
            <Section title="Folders">
              <Choice
                label="On top"
                selected={sort.folders === "top"}
                onSelect={() => changeFolders(sort, "top", onChange)}
              />
              <Choice
                label="Mixed with files"
                selected={sort.folders === "mixed"}
                onSelect={() => changeFolders(sort, "mixed", onChange)}
              />
            </Section>
          </>
        ) : null}
      </div>
    </>,
    document.body,
  );
}

function changeFolders(
  sort: ListingSort,
  folders: FolderPlacement,
  onChange: (sort: ListingSort) => void,
) {
  onChange({ ...sort, folders });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted">{title}</p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="my-1 border-t border-line" />;
}

function Choice({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-ink hover:bg-chrome"
      onClick={onSelect}
    >
      <span>{label}</span>
      {selected ? <Check className="size-4 text-primary" /> : null}
    </button>
  );
}

function directionOptions(
  sortBy: SortBy,
): Array<{ value: SortDir; label: string }> {
  if (sortBy === "name") {
    return [
      { value: "asc", label: "A to Z" },
      { value: "desc", label: "Z to A" },
    ];
  }
  return [
    { value: "desc", label: "New to old" },
    { value: "asc", label: "Old to new" },
  ];
}

function useCloseOnMove(onClose: () => void) {
  useEffect(() => {
    const close = () => onClose();
    document.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [onClose]);
}

const MENU_WIDTH = 224;
const EDGE = 12;

function menuBox(anchor: DOMRect, showFolders: boolean) {
  const height = showFolders ? 360 : 280;
  const gap = 6;
  const floor = window.matchMedia("(min-width: 1024px)").matches ? EDGE : 80;
  const openUp = window.innerHeight - anchor.bottom < height + floor;
  const top = openUp
    ? Math.max(EDGE, anchor.top - height - gap)
    : anchor.bottom + gap;
  const left = Math.min(
    Math.max(EDGE, anchor.right - MENU_WIDTH),
    window.innerWidth - MENU_WIDTH - EDGE,
  );
  return { top, left };
}
