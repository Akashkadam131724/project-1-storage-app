import { describe, expect, it } from "vitest";
import { formatMmSs } from "./otp-timer.ts";

describe("formatMmSs", () => {
  it("pads seconds and clamps below zero", () => {
    expect(formatMmSs(0)).toBe("0:00");
    expect(formatMmSs(9)).toBe("0:09");
    expect(formatMmSs(60)).toBe("1:00");
    expect(formatMmSs(-3)).toBe("0:00");
  });
});
