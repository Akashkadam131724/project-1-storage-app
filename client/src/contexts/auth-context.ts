import { createContext, useContext } from "react";
import type { PublicUser } from "../apis/types.ts";

export const sessionKey = ["session"] as const;

export type AuthContextValue = {
  user: PublicUser | null;
  isReady: boolean;
  setSession: (user: PublicUser | null) => void;
  refresh: () => Promise<unknown>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return auth;
}
