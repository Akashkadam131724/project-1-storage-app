import { useState, type MouseEvent, type ReactNode } from "react";
import { ArrowUpDown, Check } from "lucide-react";
import {
  listingSortForField,
  type FolderPlacement,
  type ListingSort,
  type SortBy,
  type SortDir,
} from "../../apis/listing.ts";
import { placePopover, Popover } from "../../components/ui/popover.tsx";

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
    setBox(
      placePopover(event.currentTarget.getBoundingClientRect(), {
        width: 224,
        height: showFolders ? 360 : 280,
      }),
    );
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
        <Popover
          box={box}
          widthClass="w-56"
          label="Sort"
          closeLabel="Close sort menu"
          onClose={() => setBox(null)}
        >
          <SortPanel
            sort={sort}
            showFolders={showFolders}
            onChange={onChange}
          />
        </Popover>
      ) : null}
    </div>
  );
}

function SortPanel({
  sort,
  showFolders,
  onChange,
}: {
  sort: ListingSort;
  showFolders: boolean;
  onChange: (sort: ListingSort) => void;
}) {
  const directions = directionOptions(sort.sortBy);

  return (
    <>
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
    </>
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
