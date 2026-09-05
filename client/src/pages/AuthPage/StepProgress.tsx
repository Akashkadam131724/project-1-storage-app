export function StepProgress({ step }: { step: "credentials" | "otp" }) {
  const onOtp = step === "otp";

  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-4">
        <StepDot label="1" active={!onOtp} complete={onOtp} />
        <div
          className={`h-1 w-8 rounded-full ${onOtp ? "bg-emerald-500" : "bg-line"}`}
        />
        <StepDot label="2" active={onOtp} complete={false} />
      </div>
    </div>
  );
}

function StepDot({
  label,
  active,
  complete,
}: {
  label: string;
  active: boolean;
  complete: boolean;
}) {
  const tone = complete
    ? "border-emerald-500 bg-emerald-500 text-white"
    : active
      ? "border-primary bg-primary text-on-primary"
      : "border-line bg-transparent text-muted";

  return (
    <div
      className={`flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium ${tone}`}
    >
      {label}
    </div>
  );
}
