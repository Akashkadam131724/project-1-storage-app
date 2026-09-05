import { KeyRound, ListChecks, Palette, Shield, User } from "lucide-react";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { AccountTile } from "../../components/ui/account-row.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { isAdmin } from "../../utils/roles.ts";
import { paths } from "../../utils/paths.ts";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <PageCanvas title="Settings" back>
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
        <AccountTile
          to={paths.roadmap}
          icon={ListChecks}
          title="Roadmap"
          hint="Auth on prod, then S3"
        />
        {isAdmin(user) ? (
          <AccountTile
            to={paths.admin}
            icon={Shield}
            title="Admin"
            hint="Users, roles, and accounts"
          />
        ) : null}
      </div>
    </PageCanvas>
  );
}
