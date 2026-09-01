import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { registerAccount, requestSignupCode, signIn } from "../../apis/auth.ts";
import { ApiError } from "../../apis/http.ts";
import { useAuth } from "../../contexts/auth-context.ts";
import { GuestRoute } from "../../components/routes/guest-route.tsx";
import { paths } from "../../utils/paths.ts";
import {
  AuthField,
  AuthShell,
  authFormClass,
  authSubmitClass,
} from "./AuthShell.tsx";

export function RegisterPage() {
  return (
    <GuestRoute>
      <RegisterForm />
    </GuestRoute>
  );
}

function RegisterForm() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    password: "",
    code: "",
  });
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await submitRegister(draft, awaitingCode, setAwaitingCode);
      if (!awaitingCode) return;
      const profile = await signIn(draft.email, draft.password);
      setSession(profile);
      void navigate(paths.home);
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
      title="Create your account"
      subtitle="Get a verification code, then start storing files."
    >
      <form
        className={authFormClass}
        onSubmit={(event) => void handleSubmit(event)}
      >
        <RegisterFields
          draft={draft}
          awaitingCode={awaitingCode}
          onChange={setDraft}
        />
        <button type="submit" className={authSubmitClass} disabled={busy}>
          {awaitingCode ? "Create account" : "Send code"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link className="font-medium text-primary" to={paths.login}>
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

type Draft = {
  name: string;
  email: string;
  password: string;
  code: string;
};

async function submitRegister(
  draft: Draft,
  awaitingCode: boolean,
  setAwaitingCode: (value: boolean) => void,
) {
  if (!awaitingCode) {
    const result = await requestSignupCode(draft.email);
    toast.message(
      result?.code
        ? `Verification code: ${result.code}`
        : "Verification code sent",
    );
    setAwaitingCode(true);
    return;
  }
  await registerAccount(draft);
}

function RegisterFields({
  draft,
  awaitingCode,
  onChange,
}: {
  draft: Draft;
  awaitingCode: boolean;
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
      {awaitingCode ? (
        <AuthField
          id="code"
          label="Verification code"
          placeholder="4-digit code"
          value={draft.code}
          onChange={(event) => patch("code", event.target.value)}
          required
          inputMode="numeric"
          maxLength={4}
        />
      ) : null}
    </>
  );
}
