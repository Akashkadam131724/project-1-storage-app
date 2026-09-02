import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { signOutAll } from "../../apis/auth.ts";
import {
  changePassword,
  deleteMe,
  disableMe,
  setPassword,
} from "../../apis/users.ts";
import { Modal } from "../../components/ui/modal.tsx";
import { PanelCard } from "../../components/ui/panel-card.tsx";
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
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary"
            disabled={busy}
          >
            Update password
          </button>
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
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary"
          disabled={busy}
        >
          Set password
        </button>
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
      <button
        type="button"
        className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-chrome"
        disabled={busy}
        onClick={() => void handleLogoutAll()}
      >
        Sign out everywhere
      </button>
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
        <button
          type="button"
          className="rounded-full border border-red-500/25 px-4 py-2 text-sm text-red-600 hover:bg-red-500/10"
          onClick={() => setConfirm("disable")}
        >
          Disable account
        </button>
        <button
          type="button"
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white"
          onClick={() => setConfirm("delete")}
        >
          Delete account
        </button>
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
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="text-sm text-muted"
            onClick={() => setConfirm(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-medium text-white"
            onClick={() => void runDanger()}
          >
            Confirm
          </button>
        </div>
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
    <label className="block text-sm" htmlFor={id}>
      <span className="text-muted">{label}</span>
      <input
        id={id}
        type="password"
        minLength={8}
        required
        className="mt-1.5 w-full rounded-xl border border-line bg-search px-3.5 py-2.5 text-sm outline-none ring-primary/20 transition focus:border-primary focus:ring-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
