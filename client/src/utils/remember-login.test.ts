import { afterEach, describe, expect, it } from "vitest";
import {
  clearRememberedEmail,
  loadRememberedEmail,
  persistRememberedEmail,
} from "./remember-login.ts";

afterEach(() => {
  localStorage.clear();
});

describe("remember login", () => {
  it("saves and loads an email when remember is on", () => {
    persistRememberedEmail("  ada@storage.app  ", true);
    expect(loadRememberedEmail()).toBe("ada@storage.app");
  });

  it("clears the saved email when remember is off", () => {
    persistRememberedEmail("ada@storage.app", true);
    persistRememberedEmail("ada@storage.app", false);
    expect(loadRememberedEmail()).toBeNull();
    clearRememberedEmail();
  });
});
