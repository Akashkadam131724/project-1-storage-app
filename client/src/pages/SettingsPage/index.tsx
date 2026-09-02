import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  changePassword,
  deleteMe,
  disableMe,
  setPassword,
  updateProfile,
} from "../../apis/users.ts";
import { signOutAll } from "../../apis/auth.ts";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { Modal } from "../../components/ui/modal.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { toastApiError } from "../../utils/api-error.ts";
import { paths } from "../../utils/paths.ts";

export function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <PageCanvas title="Settings" backTo={paths.home}>
      <div className="mx-auto max-w-xl space-y-6">
        <ProfileCard name={user.name} email={user.email} />
        {user.hasPassword ? <ChangePasswordCard /> : <SetPasswordCard />}
        <SessionsCard />
        <DangerCard />
      </div>
    </PageCanvas>
  );
}

function ProfileCard({ name, email }: { name: string; email: string }) {
  const { setSession } = useAuth();
  const [value, setValue] = useState(name);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const profile = await updateProfile(value.trim());
      setSession(profile);
      toast.success("Profile updated");
    } catch (error) {
      toastApiError(error, "Could not update profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsCard title="Profile">
      <form
        className="space-y-3"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <label className="block text-sm">
          <span className="text-muted">Name</span>
          <input
            className="mt-1 w-full rounded-lg border border-line bg-search px-3 py-2 text-sm"
            value={value}
            minLength={2}
            required
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <p className="text-sm text-muted">{email}</p>
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary"
          disabled={busy}
        >
          Save name
        </button>
      </form>
    </SettingsCard>
  );
}

function ChangePasswordCard() {
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
    <SettingsCard title="Password">
      <form
        className="space-y-3"
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
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary"
          disabled={busy}
        >
          Update password
        </button>
      </form>
    </SettingsCard>
  );
}

function SetPasswordCard() {
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
    <SettingsCard title="Set a password">
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
    </SettingsCard>
  );
}

function SessionsCard() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleLogoutAll() {
    setBusy(true);
    try {
      await signOutAll();
      setSession(null);
      void navigate(paths.login);
    } catch (error) {
      toastApiError(error, "Could not sign out everywhere");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsCard title="Sessions">
      <p className="mb-3 text-sm text-muted">
        Sign out of Storage on every device.
      </p>
      <button
        type="button"
        className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-chrome"
        disabled={busy}
        onClick={() => void handleLogoutAll()}
      >
        Sign out everywhere
      </button>
    </SettingsCard>
  );
}

function DangerCard() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<"disable" | "delete" | null>(null);

  async function runDanger() {
    if (!confirm) return;
    try {
      if (confirm === "disable") await disableMe();
      else await deleteMe();
      setSession(null);
      void navigate(paths.login);
    } catch (error) {
      toastApiError(error, "Could not update account");
    } finally {
      setConfirm(null);
    }
  }

  return (
    <SettingsCard title="Danger zone">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-full border border-line px-4 py-2 text-sm text-ink hover:bg-chrome"
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
    </SettingsCard>
  );
}

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-chrome/40 p-5">
      <h2 className="mb-3 text-sm font-medium text-ink">{title}</h2>
      {children}
    </section>
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
        className="mt-1 w-full rounded-lg border border-line bg-search px-3 py-2 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
