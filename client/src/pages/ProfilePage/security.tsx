import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { signOutAll } from "../../apis/auth.ts";
import {
  changePassword,
  deleteMe,
  disableMe,
  setPassword,
} from "../../apis/users.ts";
import { Button } from "../../components/ui/button.tsx";
import { DialogActions } from "../../components/ui/dialog-actions.tsx";
import { Modal } from "../../components/ui/modal.tsx";
import { PanelCard } from "../../components/ui/panel-card.tsx";
import { TextField } from "../../components/ui/text-field.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { toastApiError } from "../../utils/api-error.ts";

export function ChangePasswordCard() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNext] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrent("");
      setNext("");
      toast.success("Password updated");
    } catch (error) {
      toastApiError(error, "Could not update password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelCard
      title="Change password"
      description="Use at least 8 characters. You will need the current password to change it."
    >
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <PasswordField
          id="current-password"
          label="Current password"
          value={currentPassword}
          onChange={setCurrent}
        />
        <PasswordField
          id="new-password"
          label="New password"
          value={newPassword}
          onChange={setNext}
        />
        <div className="sm:col-span-2">
          <Button type="submit" size="md" disabled={busy}>
            Update password
          </Button>
        </div>
      </form>
    </PanelCard>
  );
}

export function SetPasswordCard() {
  const { refresh } = useAuth();
  const [password, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await setPassword(password);
      await refresh();
      toast.success("Password set");
    } catch (error) {
      toastApiError(error, "Could not set password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelCard
      title="Set a password"
      description="Add a password so you can sign in with email on any device."
    >
      <form
        className="space-y-3"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <PasswordField
          id="set-password"
          label="New password"
          value={password}
          onChange={setValue}
        />
        <Button type="submit" size="md" disabled={busy}>
          Set password
        </Button>
      </form>
    </PanelCard>
  );
}

export function SessionsCard() {
  const { setSession } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleLogoutAll() {
    setBusy(true);
    try {
      await signOutAll();
      setSession(null);
    } catch (error) {
      toastApiError(error, "Could not sign out everywhere");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PanelCard
      title="Sessions"
      description="Sign out of Storage on every device using this account."
    >
      <Button
        variant="outline"
        size="md"
        disabled={busy}
        onClick={() => void handleLogoutAll()}
      >
        Sign out everywhere
      </Button>
    </PanelCard>
  );
}

export function DangerCard() {
  const { setSession } = useAuth();
  const [confirm, setConfirm] = useState<"disable" | "delete" | null>(null);

  async function runDanger() {
    if (!confirm) return;
    try {
      if (confirm === "disable") await disableMe();
      else await deleteMe();
      setSession(null);
    } catch (error) {
      toastApiError(error, "Could not update account");
    } finally {
      setConfirm(null);
    }
  }

  return (
    <PanelCard
      title="Danger zone"
      description="Disable pauses sign-in. Delete removes this account and its files."
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant="danger-outline"
          size="md"
          onClick={() => setConfirm("disable")}
        >
          Disable account
        </Button>
        <Button variant="danger" size="md" onClick={() => setConfirm("delete")}>
          Delete account
        </Button>
      </div>
      <Modal
        open={Boolean(confirm)}
        title={confirm === "delete" ? "Delete account?" : "Disable account?"}
        onClose={() => setConfirm(null)}
      >
        <p className="text-sm text-muted">
          {confirm === "delete"
            ? "Your files and folders will be removed. This cannot be undone."
            : "You will be signed out and will not be able to sign in until an admin restores the account."}
        </p>
        <DialogActions>
          <Button variant="ghost" onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => void runDanger()}>
            Confirm
          </Button>
        </DialogActions>
      </Modal>
    </PanelCard>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      id={id}
      label={label}
      type="password"
      minLength={8}
      required
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
