import { afterEach, describe, expect, it, vi } from "vitest";
import { logDeviceMutation } from "./deviceLogger";

describe("device mutation diagnostics", () => {
  afterEach(() => vi.restoreAllMocks());

  it("logs only the operation and outcome, never an error payload", () => {
    const output = vi.spyOn(console, "error").mockImplementation(() => {});
    logDeviceMutation("update_record", "failure");
    expect(output).toHaveBeenCalledExactlyOnceWith({
      scope: "device_finance", action: "update_record", event: "failure",
    });
  });

  it("records successful saves separately", () => {
    const output = vi.spyOn(console, "info").mockImplementation(() => {});
    logDeviceMutation("replace_data", "success");
    expect(output).toHaveBeenCalledExactlyOnceWith({
      scope: "device_finance", action: "replace_data", event: "success",
    });
  });
});