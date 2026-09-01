import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "../../contexts/theme/theme-context.ts";
import { themes, type ThemeOption } from "../../contexts/theme/themes.ts";
import { IconButton } from "./icon-button.tsx";

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className="relative" ref={root}>
      <IconButton
        label="Choose theme"
        onClick={() => setOpen((value) => !value)}
      >
        <Palette className="size-5" />
      </IconButton>
      {open ? <ThemePanel onPick={() => setOpen(false)} /> : null}
    </div>
  );
}

function ThemePanel({ onPick }: { onPick: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl bg-canvas p-3 shadow-raise">
      <p className="px-1 pb-2 text-xs font-medium text-muted">Appearance</p>
      <div className="grid grid-cols-1 gap-1">
        {themes.map((option) => (
          <ThemeChoice
            key={option.id}
            option={option}
            selected={theme === option.id}
            onSelect={() => {
              setTheme(option.id);
              onPick();
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeChoice({
  option,
  selected,
  onSelect,
}: {
  option: ThemeOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={[
        "flex items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors",
        selected
          ? "bg-primary-container font-medium text-on-primary-container"
          : "text-ink hover:bg-chrome",
      ].join(" ")}
      onClick={onSelect}
    >
      <span
        className="flex size-8 overflow-hidden rounded-full ring-1 ring-line"
        style={{ background: option.chrome }}
        aria-hidden
      >
        <span className="w-1/2" style={{ background: option.canvas }} />
        <span className="w-1/2" style={{ background: option.primary }} />
      </span>
      {option.name}
    </button>
  );
}
