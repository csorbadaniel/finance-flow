import { describe, expect, it } from "vitest";

import { formatDateTime, formatDisplayDate, formatMonthKey, toIsoDate } from "./dates";

describe("shared date formatting (YYYY-MM-DD everywhere)", () => {
  it("formats a Date as YYYY-MM-DD in local time", () => {
    expect(toIsoDate(new Date(2026, 8, 2))).toBe("2026-09-02");
  });

  it("shows record dates as YYYY-MM-DD without shifting the day", () => {
    expect(formatDisplayDate("2026-09-01")).toBe("2026-09-01");
  });

  it("shows month labels as YYYY-MM", () => {
    expect(formatMonthKey("2026-08")).toBe("2026-08");
  });

  it("shows timestamps as YYYY-MM-DD HH:mm", () => {
    expect(formatDateTime(new Date(2026, 9, 28, 7, 5).toISOString())).toBe("2026-10-28 07:05");
  });
});
