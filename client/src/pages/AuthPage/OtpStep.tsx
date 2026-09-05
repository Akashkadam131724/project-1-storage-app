import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ApiError } from "../../apis/http.ts";
import { AuthField } from "./AuthShell.tsx";
import { OTP_RESEND_SECONDS, formatMmSs } from "./otp-timer.ts";

export function OtpStep({
  email,
  code,
  onCode,
  busy,
  onBack,
  onResend,
  backLabel = "Back to details",
}: {
  email: string;
  code: string;
  onCode: (value: string) => void;
  busy: boolean;
  onBack: () => void;
  onResend: () => Promise<void>;
  backLabel?: string;
}) {
  const [resendIn, setResendIn] = useState(OTP_RESEND_SECONDS);

  useEffect(() => {
    const id = window.setInterval(() => {
      setResendIn((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  async function handleResend() {
    try {
      await onResend();
      setResendIn(OTP_RESEND_SECONDS);
      onCode("");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not resend code",
      );
    }
  }

  const canResend = !busy && resendIn === 0;

  return (
    <div className="space-y-5">
      <div className="rounded-lg bg-primary/10 px-4 py-3 text-center">
        <p className="text-sm text-ink">
          We&apos;ve sent a 4-digit verification code to
        </p>
        <p className="mt-0.5 font-medium text-ink">{email}</p>
      </div>

      <AuthField
        id="code"
        label="Verification code"
        placeholder="Enter 4-digit code"
        value={code}
        onChange={(event) =>
          onCode(event.target.value.replace(/\D/g, "").slice(0, 4))
        }
        required
        inputMode="numeric"
        maxLength={4}
        autoComplete="one-time-code"
        autoFocus
        className="text-center tracking-[0.4em]"
      />

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          className="font-medium text-primary"
          onClick={onBack}
        >
          ← {backLabel}
        </button>
        <button
          type="button"
          className="font-medium text-primary disabled:opacity-50"
          disabled={!canResend}
          onClick={() => void handleResend()}
        >
          {resendIn > 0 ? `Resend in ${formatMmSs(resendIn)}` : "Resend code"}
        </button>
      </div>
    </div>
  );
}
