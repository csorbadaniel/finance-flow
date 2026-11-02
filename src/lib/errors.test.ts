import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";

describe("recoverable error handling", () => {
  it("preserves actionable errors without treating unknown values as messages", () => {
    const actionable = new Error("Free up browser storage, then try again.");
    expect(getErrorMessage(actionable)).toBe(actionable.message);
    expect(getErrorMessage({ message: "untrusted" })).toBe("Something went wrong. Please try again.");
    expect(getErrorMessage(new Error("  "), "Could not import data. Please try again.")).toBe("Could not import data. Please try again.");
  });
});