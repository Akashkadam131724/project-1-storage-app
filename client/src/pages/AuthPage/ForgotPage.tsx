import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { requestPasswordReset, resetPassword } from "../../apis/auth.ts";
import { Button } from "../../components/ui/button.tsx";
import { GuestRoute } from "../../components/routes/guest-route.tsx";
import { toastApiError } from "../../utils/api-error.ts";
import { paths } from "../../utils/paths.ts";
import { AuthField, AuthShell, authFormClass } from "./AuthShell.tsx";
import { OtpStep } from "./OtpStep.tsx";
import { StepProgress } from "./StepProgress.tsx";

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

  async function sendCode() {
    await requestPasswordReset(email);
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
      await resetPassword({ email, code, password });
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
      title={awaitingCode ? "Verify your email" : "Reset your password"}
      subtitle={
        awaitingCode
          ? "Enter the verification code sent to your email"
          : "Enter the email of an account you already created."
      }
    >
      <form
        className={authFormClass}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <StepProgress step={awaitingCode ? "otp" : "credentials"} />
        {awaitingCode ? (
          <>
            <OtpStep
              email={email}
              code={code}
              onCode={setCode}
              busy={busy}
              onBack={() => {
                setAwaitingCode(false);
                setCode("");
                setPassword("");
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
            <AuthField
              id="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </>
        ) : (
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
        )}
        <Button
          type="submit"
          shape="rounded"
          size="lg"
          block
          disabled={busy}
          className="font-semibold"
        >
          {awaitingCode ? "Update password" : "Send code"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        No account yet?{" "}
        <Link className="font-medium text-primary underline" to={paths.register}>
          Create an account
        </Link>
        <span className="mx-2 text-line">·</span>
        <Link className="font-medium text-primary underline" to={paths.login}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
