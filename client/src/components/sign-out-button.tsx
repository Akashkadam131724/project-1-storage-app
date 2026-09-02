import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "../apis/auth.ts";
import { useAuth } from "../contexts/auth-context.ts";
import { paths } from "../utils/paths.ts";
import { Button, ButtonLink } from "./ui/button.tsx";
import { DialogActions } from "./ui/dialog-actions.tsx";
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
      <Button variant="danger-soft" shape="rounded" onClick={requestSignOut}>
        <LogOut className="size-4" />
        Sign out
      </Button>
      <Modal
        open={confirmGuest}
        title="Leave this guest drive?"
        onClose={() => setConfirmGuest(false)}
      >
        <p className="text-sm text-muted">
          Guest files are temporary. Sign out now and this drive will be
          deleted. Create an account if you want to keep your files.
        </p>
        <DialogActions>
          <Button variant="ghost" onClick={() => setConfirmGuest(false)}>
            Cancel
          </Button>
          <ButtonLink
            to={paths.register}
            onClick={() => setConfirmGuest(false)}
          >
            Create an account
          </ButtonLink>
          <Button variant="danger" onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        </DialogActions>
      </Modal>
    </>
  );
}
