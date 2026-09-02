import { KeyRound } from "lucide-react";
import { KeepFilesCard } from "../../components/keep-files-card.tsx";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import {
  ChangePasswordCard,
  SetPasswordCard,
} from "../ProfilePage/security.tsx";

export function PasswordPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <PageCanvas title="Reset password" back>
      {user.isGuest ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <KeepFilesCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex items-start gap-3 lg:col-span-2">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
              <KeyRound className="size-4" />
            </span>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              {user.hasPassword
                ? "Change the password you use to sign in to Storage."
                : "Add a password so you can sign in with email on any device."}
            </p>
          </div>
          {user.hasPassword ? <ChangePasswordCard /> : <SetPasswordCard />}
        </div>
      )}
    </PageCanvas>
  );
}
