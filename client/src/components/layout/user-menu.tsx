import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, X } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "../../apis/auth.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import { paths } from "../../utils/paths.ts";

export function UserMenu() {
  const { user, setSession } = useAuth();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const name = user?.name ?? "Account";
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      toast.error("Could not sign out");
    }
    setSession(null);
    setOpen(false);
    void navigate(paths.login);
  }

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        aria-label="Account"
        className="rounded-full p-1 hover:bg-line"
        onClick={() => setOpen((value) => !value)}
      >
        <UserAvatar name={name} picture={user?.picture} size="sm" />
      </button>
      {open ? (
        <UserMenuCard
          name={name}
          email={user?.email ?? ""}
          picture={user?.picture}
          initial={initial}
          onClose={() => setOpen(false)}
          onSignOut={() => void handleSignOut()}
        />
      ) : null}
    </div>
  );
}

function UserMenuCard({
  name,
  email,
  picture,
  initial,
  onClose,
  onSignOut,
}: {
  name: string;
  email: string;
  picture?: string;
  initial: string;
  onClose: () => void;
  onSignOut: () => void;
}) {
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
        <p className="mb-2 text-sm text-muted">{email}</p>
        <UserAvatar name={name} picture={picture} size="lg" />
        <p className="mt-2 font-semibold text-ink">Hello {name}</p>
      </div>
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-canvas px-4 py-3 text-sm text-ink hover:bg-line"
        onClick={onSignOut}
      >
        <LogOut className="size-4 text-muted" />
        Sign out
      </button>
      <span className="sr-only">{initial}</span>
    </div>
  );
}

function UserAvatar({
  name,
  picture,
  size,
}: {
  name: string;
  picture?: string;
  size: "sm" | "lg";
}) {
  const box = size === "lg" ? "size-16 text-xl" : "size-8 text-sm";
  if (picture) {
    return (
      <img
        src={picture}
        alt=""
        className={`${box} rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      className={`flex ${box} items-center justify-center rounded-full bg-primary font-medium text-on-primary`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
