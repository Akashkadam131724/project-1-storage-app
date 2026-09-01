import { useEffect, useRef, useState } from "react";
import { LogOut, X } from "lucide-react";

const demoUser = {
  name: "Ada Lovelace",
  email: "ada@storage.app",
};

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const initial = demoUser.name.charAt(0).toUpperCase();

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
      <button
        type="button"
        aria-label="Account"
        className="rounded-full p-1 hover:bg-line"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-on-primary">
          {initial}
        </span>
      </button>
      {open ? <UserMenuCard onClose={() => setOpen(false)} /> : null}
    </div>
  );
}

function UserMenuCard({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-chrome p-6 lg:absolute lg:inset-auto lg:right-0 lg:top-12 lg:h-auto lg:w-80 lg:rounded-2xl lg:shadow-raise">
      <button
        type="button"
        aria-label="Close account menu"
        className="absolute right-4 top-4 rounded-full p-1.5 text-muted hover:bg-canvas"
        onClick={onClose}
      >
        <X className="size-4" />
      </button>
      <div className="flex flex-col items-center text-center">
        <p className="mb-2 text-sm text-muted">{demoUser.email}</p>
        <span className="mb-2 flex size-16 items-center justify-center rounded-full bg-primary text-xl font-medium text-on-primary">
          {demoUser.name.charAt(0)}
        </span>
        <p className="font-semibold text-ink">Hello {demoUser.name}</p>
      </div>
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-canvas px-4 py-3 text-sm text-ink hover:bg-line"
      >
        <LogOut className="size-4 text-muted" />
        Sign out
      </button>
    </div>
  );
}
