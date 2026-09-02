import { useState } from "react";
import { Link } from "react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "../apis/auth.ts";
import { useAuth } from "../contexts/auth-context.ts";
import { paths } from "../utils/paths.ts";
import { Modal } from "./ui/modal.tsx";

export function SignOutButton() {
  const { user, setSession } = useAuth();
  const [confirmGuest, setConfirmGuest] = useState(false);

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      toast.error("Could not sign out");
    }
    setSession(null);
  }

  function requestSignOut() {
    if (user?.isGuest) {
      setConfirmGuest(true);
      return;
    }
    void handleSignOut();
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-500/20"
        onClick={requestSignOut}
      >
        <LogOut className="size-4" />
        Sign out
      </button>
      <Modal
        open={confirmGuest}
        title="Leave this guest drive?"
        onClose={() => setConfirmGuest(false)}
      >
        <p className="text-sm text-muted">
          Guest files are temporary. Sign out now and this drive will be
          deleted. Create an account if you want to keep your files.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="text-sm text-muted"
            onClick={() => setConfirmGuest(false)}
          >
            Cancel
          </button>
          <Link
            to={paths.register}
            className="rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-on-primary"
            onClick={() => setConfirmGuest(false)}
          >
            Create an account
          </Link>
          <button
            type="button"
            className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-medium text-white"
            onClick={() => void handleSignOut()}
          >
            Sign out
          </button>
        </div>
      </Modal>
    </>
  );
}
