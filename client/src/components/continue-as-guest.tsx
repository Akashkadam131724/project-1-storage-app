import { useState } from "react";
import { useNavigate } from "react-router";
import { continueAsGuest } from "../apis/auth.ts";
import { useAuth } from "../contexts/auth-context.ts";
import { toastApiError } from "../utils/api-error.ts";
import { paths } from "../utils/paths.ts";

export function ContinueAsGuest() {
  const { user, setSession } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (user?.isGuest) {
      void navigate(paths.home);
      return;
    }
    setBusy(true);
    try {
      const profile = await continueAsGuest();
      setSession(profile);
      void navigate(paths.home);
    } catch (error) {
      toastApiError(error, "Could not start a guest session");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="font-medium text-primary underline disabled:opacity-50"
      disabled={busy}
      onClick={() => void handleClick()}
    >
      {busy
        ? "Opening…"
        : user?.isGuest
          ? "Back to files"
          : "Continue as guest"}
    </button>
  );
}
