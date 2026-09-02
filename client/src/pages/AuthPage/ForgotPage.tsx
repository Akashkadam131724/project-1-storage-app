import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { requestPasswordReset, resetPassword } from "../../apis/auth.ts";
import { GuestRoute } from "../../components/routes/guest-route.tsx";
import { toastApiError } from "../../utils/api-error.ts";
import { paths } from "../../utils/paths.ts";
import {
  AuthField,
  AuthShell,
  authFormClass,
  authSubmitClass,
} from "./AuthShell.tsx";

export function ForgotPage() {
  return (
    <GuestRoute>
      <ForgotForm />
    </GuestRoute>
  );
}

function ForgotForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await submitReset(
        { email, code, password },
        awaitingCode,
        setAwaitingCode,
      );
      if (!awaitingCode) return;
      toast.success("Password updated. Sign in with your new password.");
      void navigate(paths.login);
    } catch (error) {
      toastApiError(error, "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We will send a 4-digit code to your email."
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
        {awaitingCode ? (
          <ResetFields
            code={code}
            password={password}
            onCode={setCode}
            onPassword={setPassword}
          />
        ) : null}
        <button type="submit" className={authSubmitClass} disabled={busy}>
          {awaitingCode ? "Update password" : "Send code"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        <Link className="font-medium text-primary" to={paths.login}>
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}

type ResetDraft = { email: string; code: string; password: string };

async function submitReset(
  draft: ResetDraft,
  awaitingCode: boolean,
  setAwaitingCode: (value: boolean) => void,
) {
  if (!awaitingCode) {
    const result = await requestPasswordReset(draft.email);
    toast.message(
      result?.code
        ? `Reset code: ${result.code}`
        : "If that email exists, a reset code was sent",
    );
    setAwaitingCode(true);
    return;
  }
  await resetPassword(draft);
}

function ResetFields({
  code,
  password,
  onCode,
  onPassword,
}: {
  code: string;
  password: string;
  onCode: (value: string) => void;
  onPassword: (value: string) => void;
}) {
  return (
    <>
      <AuthField
        id="code"
        label="Reset code"
        placeholder="4-digit code"
        value={code}
        onChange={(event) => onCode(event.target.value)}
        required
        inputMode="numeric"
        maxLength={4}
      />
      <AuthField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(event) => onPassword(event.target.value)}
        required
        minLength={8}
      />
    </>
  );
}
