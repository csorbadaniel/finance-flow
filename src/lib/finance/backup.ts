/**
 * Backup (export / import) of the finance data.
 *
 * Two interchangeable formats are supported:
 * - JSON: an object with `categories`, `purses` and `transactions` arrays.
 * - CSV: one flat table where the first column (`kind`) tells which entity the
 *   row describes. Unused columns are left empty.
 */
import { DEFAULT_CURRENCY, type CurrencyCode } from "./currency";
import type { Category, Purse, Transaction, TransactionType } from "./types";

export const BACKUP_VERSION = 1;

export interface BackupData {
  categories: Category[];
  purses: Purse[];
  transactions: Transaction[];
  currency?: CurrencyCode;
}

export interface BackupFile extends BackupData {
  version: number;
  exportedAt: string;
}

export const CSV_COLUMNS = [
  "kind",
  "id",
  "name",
  "parentId",
  "level",
  "isDefault",
  "recordNumber",
  "type",
  "amount",
  "categoryId",
  "purseId",
  "date",
  "note",
] as const;

// ---- Serialization ------------------------------------------------------

export function toJson(data: BackupData): string {
  const file: BackupFile = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    currency: data.currency ?? DEFAULT_CURRENCY,
    categories: data.categories,
    purses: data.purses,
    transactions: data.transactions,
  };
  return JSON.stringify(file, null, 2);
}

function csvCell(value: unknown): string {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function csvRow(values: Record<string, unknown>): string {
  return CSV_COLUMNS.map((c) => csvCell(values[c])).join(",");
}

export function toCsv(data: BackupData): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const c of data.categories) {
    lines.push(csvRow({ kind: "category", id: c.id, name: c.name, parentId: c.parentId ?? "", level: c.level }));
  }
  for (const p of data.purses) {
    lines.push(csvRow({ kind: "purse", id: p.id, name: p.name, isDefault: p.isDefault }));
  }
  for (const t of data.transactions) {
    lines.push(
      csvRow({
        kind: "transaction",
        id: t.id,
        recordNumber: t.recordNumber,
        type: t.type,
        amount: t.amount,
        categoryId: t.categoryId,
        purseId: t.purseId,
        date: t.date,
        note: t.note ?? "",
      }),
    );
  }
  return lines.join("\n");
}

// ---- Parsing ------------------------------------------------------------

/** Splits a CSV text into rows of cells, honouring quoted values. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function fail(message: string): never {
  throw new Error(message);
}

function normalizeData(input: Partial<BackupData>): BackupData {
  const categories = input.categories ?? [];
  const purses = input.purses ?? [];
  const transactions = input.transactions ?? [];
  if (!Array.isArray(categories) || !Array.isArray(purses) || !Array.isArray(transactions)) {
    fail("The file does not contain the expected lists of categories, purses and records.");
  }
  if (purses.length === 0) fail("The file must contain at least one purse.");
  if (categories.length === 0) fail("The file must contain at least one category.");

  const categoryIds = new Set(categories.map((c) => c.id));
  const purseIds = new Set(purses.map((p) => p.id));
  for (const t of transactions) {
    if (!(t.amount > 0)) fail(`Record ${t.recordNumber || t.id} has an invalid amount.`);
    if (!categoryIds.has(t.categoryId)) fail(`Record ${t.recordNumber || t.id} refers to an unknown category.`);
    if (!purseIds.has(t.purseId)) fail(`Record ${t.recordNumber || t.id} refers to an unknown purse.`);
  }
  if (!purses.some((p) => p.isDefault)) purses[0] = { ...purses[0], isDefault: true };

  return { categories, purses, transactions, currency: input.currency };
}

export function parseJsonBackup(text: string): BackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail("This file is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") fail("This file is not a valid backup.");
  return normalizeData(parsed as Partial<BackupData>);
}

export function parseCsvBackup(text: string): BackupData {
  const rows = parseCsvRows(text);
  if (rows.length < 2) fail("This CSV file is empty.");
  const header = rows[0].map((h) => h.trim());
  if (header[0] !== "kind") fail('The first CSV column must be named "kind".');
  const index = (name: string) => header.indexOf(name);
  const get = (row: string[], name: string): string => {
    const i = index(name);
    return i === -1 ? "" : (row[i] ?? "").trim();
  };

  const categories: Category[] = [];
  const purses: Purse[] = [];
  const transactions: Transaction[] = [];

  for (const row of rows.slice(1)) {
    const kind = (row[0] ?? "").trim().toLowerCase();
    if (kind === "category") {
      const level = Number(get(row, "level")) || 1;
      categories.push({
        id: get(row, "id") || `cat-${crypto.randomUUID()}`,
        name: get(row, "name"),
        parentId: get(row, "parentId") || null,
        level: (level >= 1 && level <= 3 ? level : 1) as 1 | 2 | 3,
      });
    } else if (kind === "purse") {
      purses.push({
        id: get(row, "id") || `purse-${crypto.randomUUID()}`,
        name: get(row, "name"),
        isDefault: get(row, "isDefault").toLowerCase() === "true",
      });
    } else if (kind === "transaction") {
      const type = get(row, "type").toLowerCase();
      if (type !== "income" && type !== "expense") fail(`Unknown record type "${type}".`);
      const amount = Number(get(row, "amount").replace(",", "."));
      transactions.push({
        id: get(row, "id") || `txn-${crypto.randomUUID()}`,
        recordNumber: get(row, "recordNumber") || "00000",
        type: type as TransactionType,
        amount,
        categoryId: get(row, "categoryId"),
        purseId: get(row, "purseId"),
        date: get(row, "date"),
        note: get(row, "note") || undefined,
        createdAt: new Date().toISOString(),
      });
    } else if (kind) {
      fail(`Unknown row type "${kind}". Use category, purse or transaction.`);
    }
  }

  return normalizeData({ categories, purses, transactions });
}

/** Parses a backup based on the file name / content. */
export function parseBackup(text: string, fileName = ""): BackupData {
  const isCsv = fileName.toLowerCase().endsWith(".csv") || !text.trim().startsWith("{");
  return isCsv ? parseCsvBackup(text) : parseJsonBackup(text);
}

// ---- Example file -------------------------------------------------------

export const exampleBackup: BackupData = {
  currency: DEFAULT_CURRENCY,
  categories: [
    { id: "cat-food", name: "Food", parentId: null, level: 1 },
    { id: "cat-food-groceries", name: "Groceries", parentId: "cat-food", level: 2 },
    { id: "cat-salary", name: "Salary", parentId: null, level: 1 },
  ],
  purses: [
    { id: "purse-cash", name: "Cash", isDefault: true },
    { id: "purse-card", name: "Bank card", isDefault: false },
  ],
  transactions: [
    {
      id: "txn-example-1",
      recordNumber: "00001",
      type: "income",
      amount: 450000,
      categoryId: "cat-salary",
      purseId: "purse-card",
      date: "2026/09/01".replaceAll("/", "-"),
      note: "Monthly salary",
      createdAt: "2026-09-01T08:00:00.000Z",
    },
    {
      id: "txn-example-2",
      recordNumber: "00002",
      type: "expense",
      amount: 12500,
      categoryId: "cat-food-groceries",
      purseId: "purse-cash",
      date: "2026-09-02",
      note: "Weekly groceries",
      createdAt: "2026-09-02T17:30:00.000Z",
    },
  ],
};
