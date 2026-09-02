import { Link } from "react-router";
import { UserAvatar } from "../ui/user-avatar.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { paths } from "../../utils/paths.ts";

export function UserMenu() {
  const { user } = useAuth();
  const name = user?.name ?? "Account";

  return (
    <Link
      to={paths.profile}
      aria-label="Profile"
      title="Profile"
      className="rounded-full p-1 hover:bg-line"
    >
      <UserAvatar name={name} picture={user?.picture} size="sm" />
    </Link>
  );
}
