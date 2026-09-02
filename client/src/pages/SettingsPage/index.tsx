import { KeyRound, Palette, User } from "lucide-react";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { AccountTile } from "../../components/ui/account-row.tsx";
import { SignOutButton } from "../../components/sign-out-button.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { paths } from "../../utils/paths.ts";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <PageCanvas title="Settings" back actions={<SignOutButton />}>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted">
        Manage your account and how Storage looks on this device.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AccountTile
          to={paths.profile}
          icon={User}
          title="Profile"
          hint="Name and email"
        />
        {user?.isGuest ? null : (
          <AccountTile
            to={paths.password}
            icon={KeyRound}
            title="Reset password"
            hint="Change or set your password"
          />
        )}
        <AccountTile
          to={paths.appearance}
          icon={Palette}
          title="Appearance"
          hint="Theme for this device"
        />
      </div>
    </PageCanvas>
  );
}
