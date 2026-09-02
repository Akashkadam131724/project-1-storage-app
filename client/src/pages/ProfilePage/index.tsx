import { useState, type FormEvent } from "react";
import { KeyRound, Palette, Settings } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "../../apis/users.ts";
import { KeepFilesCard } from "../../components/keep-files-card.tsx";
import { Button } from "../../components/ui/button.tsx";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { AccountList, AccountRow } from "../../components/ui/account-row.tsx";
import { SignOutButton } from "../../components/sign-out-button.tsx";
import { TextField } from "../../components/ui/text-field.tsx";
import { UserAvatar } from "../../components/ui/user-avatar.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { toastApiError } from "../../utils/api-error.ts";
import { paths } from "../../utils/paths.ts";
import { DangerCard, SessionsCard } from "./security.tsx";

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <PageCanvas title="Profile" back actions={<SignOutButton />}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {user.isGuest ? (
          <div className="lg:col-span-2">
            <KeepFilesCard />
          </div>
        ) : null}
        <div className="lg:col-span-2">
          <ProfileCard
            name={user.name}
            email={user.isGuest ? "" : user.email}
            picture={user.picture}
          />
        </div>
        {user.isGuest ? null : <SessionsCard />}
        {user.isGuest ? null : <DangerCard />}
        <div className="lg:col-span-2">
          <AccountList>
            <AccountRow
              to={paths.settings}
              icon={Settings}
              title="Settings"
              hint="App preferences"
            />
            {user.isGuest ? null : (
              <AccountRow
                to={paths.password}
                icon={KeyRound}
                title="Reset password"
                hint="Change or set your password"
              />
            )}
            <AccountRow
              to={paths.appearance}
              icon={Palette}
              title="Appearance"
              hint="Theme for this device"
            />
          </AccountList>
        </div>
      </div>
    </PageCanvas>
  );
}

function ProfileCard({
  name,
  email,
  picture,
}: {
  name: string;
  email: string;
  picture?: string;
}) {
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
    <section className="overflow-hidden rounded-xl border border-line bg-canvas shadow-raise">
      <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <span className="mx-auto rounded-full ring-4 ring-primary-container sm:mx-0">
          <UserAvatar name={name} picture={picture} size="xl" />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-ink">Hello {name}</h2>
          {email ? (
            <p className="mt-1 text-sm text-on-primary-container">{email}</p>
          ) : null}
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="min-w-0 flex-1">
              <TextField
                label="Name"
                value={value}
                minLength={2}
                required
                onChange={(event) => setValue(event.target.value)}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="px-5 sm:mb-px"
              disabled={busy}
            >
              Save name
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
