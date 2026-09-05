import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { registerAccount, requestAuthCode } from "../../apis/auth.ts";
import { ApiError } from "../../apis/http.ts";
import { ContinueAsGuest } from "../../components/continue-as-guest.tsx";
import { SocialAuthButtons } from "../../components/social-auth-buttons.tsx";
import { Button } from "../../components/ui/button.tsx";
import { useAuth } from "../../contexts/auth-context.ts";
import { GuestRoute } from "../../components/routes/guest-route.tsx";
import { paths } from "../../utils/paths.ts";
import { OtpStep } from "./OtpStep.tsx";
import { StepProgress } from "./StepProgress.tsx";
import { AuthField, AuthShell, authFormClass } from "./AuthShell.tsx";

export function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  );
}

function RegisterForm() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    password: "",
    code: "",
  });
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const converting = Boolean(user?.isGuest);

  async function sendCode() {
    await requestAuthCode({
      email: draft.email,
      action: "register",
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
      await registerAccount(draft);
      if (converting) {
        await refresh();
        void navigate(paths.home);
        return;
      }
      toast.success("Account created. Sign in with the code we email you.");
      void navigate(paths.login);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not create account",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title={
        awaitingCode
          ? "Verify your email"
          : converting
            ? "Keep your files"
            : "Create your account"
      }
      subtitle={
        awaitingCode
          ? "Verify your email to complete registration"
          : converting
            ? "Create an account to keep this drive after you leave. We will email a 4-digit code."
            : "We will email a 4-digit code, then you can start storing files."
      }
    >
      <form
        className={authFormClass}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <StepProgress step={awaitingCode ? "otp" : "credentials"} />
        {awaitingCode ? (
          <OtpStep
            email={draft.email}
            code={draft.code}
            onCode={(code) => setDraft({ ...draft, code })}
            busy={busy}
            onBack={() => {
              setAwaitingCode(false);
              setDraft({ ...draft, code: "" });
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
          <RegisterFields draft={draft} onChange={setDraft} />
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
              ? converting
                ? "Saving…"
                : "Creating account…"
              : "Sending code…"
            : awaitingCode
              ? converting
                ? "Save account"
                : "Create account"
              : "Continue"}
        </Button>
        {awaitingCode ? null : converting ? null : <SocialAuthButtons />}
      </form>
      {awaitingCode || converting ? (
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link className="font-medium text-primary underline" to={paths.login}>
            Sign in
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link className="font-medium text-primary underline" to={paths.login}>
            Sign in
          </Link>{" "}
          or <ContinueAsGuest />
        </p>
      )}
    </AuthShell>
  );
}

type Draft = {
  name: string;
  email: string;
  password: string;
  code: string;
};

function RegisterFields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
}) {
  const patch = (field: keyof Draft, value: string) =>
    onChange({ ...draft, [field]: value });

  return (
    <>
      <AuthField
        id="name"
        label="Name"
        placeholder="Your name"
        value={draft.name}
        onChange={(event) => patch("name", event.target.value)}
        required
        minLength={2}
      />
      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={draft.email}
        onChange={(event) => patch("email", event.target.value)}
        required
      />
      <AuthField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={draft.password}
        onChange={(event) => patch("password", event.target.value)}
        required
        minLength={8}
      />
    </>
  );
}
