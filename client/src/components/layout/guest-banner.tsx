import { Link } from "react-router";
import { useAuth } from "../../contexts/auth-context.ts";
import { paths } from "../../utils/paths.ts";

export function GuestBanner() {
  const { user } = useAuth();
  if (!user?.isGuest) return null;

  return (
    <div className="flex items-center justify-center gap-3 bg-primary-container mb-4 px-4 py-2 text-sm text-on-primary-container">
      <p>You are browsing as a guest. Create an account to keep your files.</p>
      <Link className="shrink-0 font-medium underline" to={paths.register}>
        Create an account
      </Link>
    </div>
  );
}
