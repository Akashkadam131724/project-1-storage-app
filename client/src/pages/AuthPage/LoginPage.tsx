import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import {
  continueAsGuest,
  signIn,
  signInWithGoogle,
  startGithubSignIn,
} from "../../apis/auth.ts";
import { ApiError } from "../../apis/http.ts";
import { OAuthNotice } from "../../components/oauth-notice.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { GuestRoute } from "../../components/routes/guest-route.tsx";
import { env } from "../../utils/env.ts";
import { paths } from "../../utils/paths.ts";
import { toastApiError } from "../../utils/api-error.ts";
import {
  loadRememberedEmail,
  persistRememberedEmail,
} from "../../utils/remember-login.ts";
import {
  AuthField,
  AuthShell,
  authFormClass,
  authSubmitClass,
} from "./AuthShell.tsx";

export function LoginPage() {
  return (
    <GuestRoute>
      <OAuthNotice />
      <LoginForm />
    </GuestRoute>
  );
}

function LoginForm() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => loadRememberedEmail() ?? "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(() =>
    Boolean(loadRememberedEmail()),
  );
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const profile = await signIn(email, password);
      persistRememberedEmail(email, rememberMe);
      setSession(profile);
      void navigate(paths.home);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to open your files and folders."
    >
      <form
        className={authFormClass}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <RememberMe checked={rememberMe} onChange={setRememberMe} />
        <p className="-mt-2 text-right text-sm">
          <Link className="font-medium text-primary" to={paths.forgot}>
            Forgot password?
          </Link>
        </p>
        <button type="submit" className={authSubmitClass} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <ContinueAsGuest />
        <GithubSignIn />
        {env.VITE_GOOGLE_CLIENT_ID ? <GoogleSignIn /> : null}
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link className="font-medium text-primary" to={paths.register}>
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

function ContinueAsGuest() {
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
      className="w-full rounded-lg border border-line bg-canvas py-2.5 text-sm font-medium text-ink hover:bg-chrome disabled:opacity-60"
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

function GithubSignIn() {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const result = await startGithubSignIn();
      window.location.assign(result.url);
    } catch (error) {
      toastApiError(error, "GitHub sign-in is not available");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-canvas py-2.5 text-sm font-medium text-ink hover:bg-chrome disabled:opacity-60"
      disabled={busy}
      onClick={() => void handleClick()}
    >
      <GithubMark />
      {busy ? "Redirecting…" : "Continue with GitHub"}
    </button>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.68 7.68 0 0 1 8 4.64c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
      />
    </svg>
  );
}

function GoogleSignIn() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(response) => {
          if (!response.credential) return;
          void signInWithGoogle(response.credential)
            .then((profile) => {
              setSession(profile);
              void navigate(paths.home);
            })
            .catch((error: unknown) => {
              toast.error(
                error instanceof ApiError
                  ? error.message
                  : "Google sign-in failed",
              );
            });
        }}
      />
    </div>
  );
}

function RememberMe({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
      Remember me on this device
    </label>
  );
}
