import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export function OAuthNotice() {
  const [params, setParams] = useSearchParams();
  const status = params.get("auth");

  useEffect(() => {
    if (!status) return;
    if (status === "error") toast.error("GitHub sign-in failed");
    if (status === "ok") toast.success("Signed in with GitHub");
    const next = new URLSearchParams(params);
    next.delete("auth");
    setParams(next, { replace: true });
  }, [params, setParams, status]);

  return null;
}
