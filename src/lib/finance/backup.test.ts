import { describe, expect, it } from "vitest";

import { exampleBackup, parseBackup, parseCsvBackup, toCsv, toJson } from "./backup";

describe("backup export/import", () => {
  it("round-trips through JSON", () => {
    const parsed = parseBackup(toJson(exampleBackup), "backup.json");
    expect(parsed.transactions).toHaveLength(2);
    expect(parsed.categories.map((c) => c.id)).toContain("cat-food-groceries");
    expect(parsed.purses.find((p) => p.isDefault)?.id).toBe("purse-cash");
  });

  it("round-trips through CSV", () => {
    const csv = toCsv(exampleBackup);
    expect(csv.split("\n")[0]).toContain("kind,id,name");
    const parsed = parseBackup(csv, "backup.csv");
    expect(parsed.transactions).toHaveLength(2);
    expect(parsed.transactions[0].amount).toBe(450000);
    expect(parsed.transactions[1].note).toBe("Weekly groceries");
  });

  it("quotes values containing commas", () => {
    const csv = toCsv({
      ...exampleBackup,
      transactions: [{ ...exampleBackup.transactions[0], note: "Salary, September" }],
    });
    const parsed = parseCsvBackup(csv);
    expect(parsed.transactions[0].note).toBe("Salary, September");
  });

  it("rejects records referring to unknown categories", () => {
    const broken = {
      ...exampleBackup,
      transactions: [{ ...exampleBackup.transactions[0], categoryId: "cat-missing" }],
    };
    expect(() => parseBackup(JSON.stringify(broken), "x.json")).toThrow(/unknown category/i);
  });

  it("rejects invalid JSON", () => {
    expect(() => parseBackup("{nope", "x.json")).toThrow();
  });
});
