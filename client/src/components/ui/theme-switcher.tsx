import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { IconButton } from "./icon-button.tsx";
import { ThemePicker } from "./theme-picker.tsx";

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
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl bg-canvas p-3 shadow-raise">
          <p className="px-1 pb-2 text-xs font-medium text-muted">Appearance</p>
          <ThemePicker variant="menu" onPick={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
