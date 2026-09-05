import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { requestAuthCode, signIn } from "../../apis/auth.ts";
import { ApiError } from "../../apis/http.ts";
import { ContinueAsGuest } from "../../components/continue-as-guest.tsx";
import { OAuthNotice } from "../../components/oauth-notice.tsx";
import { SocialAuthButtons } from "../../components/social-auth-buttons.tsx";
import { Button } from "../../components/ui/button.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { GuestRoute } from "../../components/routes/guest-route.tsx";
import { paths } from "../../utils/paths.ts";
import {
  loadRememberedEmail,
  persistRememberedEmail,
} from "../../utils/remember-login.ts";
import { OtpStep } from "./OtpStep.tsx";
import { StepProgress } from "./StepProgress.tsx";
import { AuthField, AuthShell, authFormClass } from "./AuthShell.tsx";

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
  const [code, setCode] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [rememberMe, setRememberMe] = useState(() =>
    Boolean(loadRememberedEmail()),
  );
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    await requestAuthCode({
      email,
      action: "login",
      password,
    });
    toast.success("Verification code sent to your email");
    setAwaitingCode(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (!awaitingCode) {
        await sendCode();
        return;
      }
      const profile = await signIn(email, password, code);
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
      title={awaitingCode ? "Verify your identity" : "Welcome back"}
      subtitle={
        awaitingCode
          ? "Enter the verification code sent to your email"
          : "Sign in to open your files and folders."
      }
    >
      <form
        className={authFormClass}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <StepProgress step={awaitingCode ? "otp" : "credentials"} />
        {awaitingCode ? (
          <OtpStep
            email={email}
            code={code}
            onCode={setCode}
            busy={busy}
            onBack={() => {
              setAwaitingCode(false);
              setCode("");
            }}
            onResend={async () => {
              setBusy(true);
              try {
                await sendCode();
              } finally {
                setBusy(false);
              }
            }}
          />
        ) : (
          <>
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
          </>
        )}
        <Button
          type="submit"
          shape="rounded"
          size="lg"
          block
          disabled={busy}
          className="font-semibold"
        >
          {busy
            ? awaitingCode
              ? "Verifying…"
              : "Sending code…"
            : awaitingCode
              ? "Verify & login"
              : "Sign in"}
        </Button>
        {awaitingCode ? null : <SocialAuthButtons />}
      </form>
      {awaitingCode ? null : (
        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-primary underline" to={paths.register}>
            Create an account
          </Link>{" "}
          or <ContinueAsGuest />
        </p>
      )}
    </AuthShell>
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
