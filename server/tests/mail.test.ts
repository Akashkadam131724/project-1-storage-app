import { describe, expect, it } from "vitest";
import { isMailConfigured } from "../src/shared/lib/mail.js";

describe("mail", () => {
  it("needs both Resend API key and from address", () => {
    expect(isMailConfigured({})).toBe(false);
    expect(isMailConfigured({ RESEND_KEY: "re_test" })).toBe(false);
    expect(
      isMailConfigured({ RESEND_FROM: "Storage <no-reply@example.com>" }),
    ).toBe(false);
    expect(
      isMailConfigured({
        RESEND_KEY: "re_test",
        RESEND_FROM: "Storage <no-reply@example.com>",
      }),
    ).toBe(true);
  });
});
