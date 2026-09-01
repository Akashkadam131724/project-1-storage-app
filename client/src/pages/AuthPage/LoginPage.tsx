import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { signIn, signInWithGoogle } from "../../apis/auth.ts";
import { ApiError } from "../../apis/http.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import { GuestRoute } from "../../components/routes/guest-route.tsx";
import { env } from "../../utils/env.ts";
import { paths } from "../../utils/paths.ts";
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
        <button type="submit" className={authSubmitClass} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
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
