import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminChangeRole,
  adminDisableUser,
  adminLogoutUser,
  adminRemoveUser,
  adminRestoreUser,
  listUsers,
} from "../../apis/users.ts";
import type { AdminUser, UserRole } from "../../apis/types.ts";
import { PageCanvas } from "../../components/ui/page-canvas.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { toastApiError } from "../../utils/api-error.ts";
import { paths } from "../../utils/paths.ts";

export function AdminPage() {
  const query = useQuery({
    queryKey: ["users"],
    queryFn: () => listUsers(),
  });
  const admin = useAdminActions();
  const users = query.data?.items ?? [];

  return (
    <PageCanvas title="Admin" backTo={paths.home}>
      {query.isPending ? (
        <p className="py-16 text-center text-sm text-muted">Loading…</p>
      ) : null}
      {query.isError ? (
        <p className="py-16 text-center text-sm text-muted">
          Could not load users
        </p>
      ) : null}
      {query.data ? (
        <div className="overflow-hidden rounded-2xl border border-line">
          <AdminHeader />
          {users.map((user) => (
            <AdminUserRow key={user.id} user={user} admin={admin} />
          ))}
        </div>
      ) : null}
    </PageCanvas>
  );
}

function AdminHeader() {
  return (
    <div className="hidden grid-cols-[1fr_8rem_6rem_auto] gap-3 bg-chrome px-4 py-2 text-xs font-medium text-muted sm:grid">
      <span>User</span>
      <span>Role</span>
      <span>Status</span>
      <span className="sr-only">Actions</span>
    </div>
  );
}

function AdminUserRow({
  user,
  admin,
}: {
  user: AdminUser;
  admin: ReturnType<typeof useAdminActions>;
}) {
  const { user: me } = useAuth();
  const isSelf = me?.id === user.id;

  return (
    <div className="flex flex-col gap-2 border-t border-line px-4 py-3 sm:grid sm:grid-cols-[1fr_8rem_6rem_auto] sm:items-center sm:gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{user.name}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <p className="text-sm text-ink">{user.role}</p>
      <p className="text-sm text-muted">
        {user.isDeleted ? "Disabled" : "Active"}
      </p>
      {isSelf ? (
        <p className="text-xs text-muted">You</p>
      ) : (
        <AdminActions user={user} admin={admin} />
      )}
    </div>
  );
}

function AdminActions({
  user,
  admin,
}: {
  user: AdminUser;
  admin: ReturnType<typeof useAdminActions>;
}) {
  const nextRole: UserRole = user.role === "Admin" ? "User" : "Admin";
  return (
    <div className="flex flex-wrap gap-1">
      <TinyButton
        label={user.isDeleted ? "Restore" : "Disable"}
        onClick={() =>
          user.isDeleted
            ? admin.restore.mutate(user.id)
            : admin.disable.mutate(user.id)
        }
      />
      <TinyButton
        label={`Make ${nextRole}`}
        onClick={() => admin.role.mutate({ userId: user.id, role: nextRole })}
      />
      <TinyButton
        label="Sign out"
        onClick={() => admin.logout.mutate(user.id)}
      />
      <TinyButton
        label="Delete"
        danger
        onClick={() => admin.remove.mutate(user.id)}
      />
    </div>
  );
}

function TinyButton({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      className={
        danger
          ? "rounded-full px-2 py-1 text-xs text-red-600 hover:bg-chrome"
          : "rounded-full px-2 py-1 text-xs text-ink hover:bg-chrome"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function useAdminActions() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });
  const opts = (message: string) => ({
    onSuccess: async () => {
      toast.success(message);
      await invalidate();
    },
    onError: (error: unknown) => toastApiError(error),
  });

  const disable = useMutation({
    mutationFn: adminDisableUser,
    ...opts("Account disabled"),
  });
  const restore = useMutation({
    mutationFn: adminRestoreUser,
    ...opts("Account restored"),
  });
  const logout = useMutation({
    mutationFn: adminLogoutUser,
    ...opts("User signed out"),
  });
  const remove = useMutation({
    mutationFn: adminRemoveUser,
    ...opts("Account deleted"),
  });
  const role = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminChangeRole(userId, role),
    ...opts("Role updated"),
  });

  return { disable, restore, logout, remove, role };
}
