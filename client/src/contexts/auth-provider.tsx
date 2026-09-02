import { useCallback, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../apis/http.ts";
import { getMe } from "../apis/users.ts";
import type { PublicUser } from "../apis/types.ts";
import { paths } from "../utils/paths.ts";
import { AuthContext, sessionKey } from "./auth-context.ts";

async function loadSession() {
  try {
    return await getMe();
  } catch (error) {
    if (error instanceof ApiError && error.status >= 500) {
      throw error;
    }
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isPending, refetch } = useQuery({
    queryKey: sessionKey,
    queryFn: loadSession,
    retry: false,
  });

  const setSession = useCallback(
    (user: PublicUser | null) => {
      const current = queryClient.getQueryData<PublicUser | null>(sessionKey);
      if (!user) {
        queryClient.clear();
        window.location.assign(paths.login);
        return;
      }
      if (current?.id !== user.id) {
        queryClient.removeQueries({
          predicate: (query) => query.queryKey[0] !== sessionKey[0],
        });
      }
      queryClient.setQueryData(sessionKey, user);
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({
      user: data ?? null,
      isReady: !isPending,
      setSession,
      refresh: () => refetch(),
    }),
    [data, isPending, refetch, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
