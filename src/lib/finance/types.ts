import type { CurrencyCode } from "./currency";

export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  /** 1 = top-level, 2 = mid, 3 = leaf */
  level: 1 | 2 | 3;
  icon?: string;
}

export interface Purse {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  /** 5-digit sequential display number, e.g. "00042" */
  recordNumber: string;
  type: TransactionType;
  /** positive number; sign is implied by `type` */
  amount: number;
  categoryId: string;
  purseId: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  note?: string;
  createdAt: string;
}

export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  purses: Purse[];
  onboardingSeen: boolean;
  /** Display currency preference; amounts are never converted. */
  currency: CurrencyCode;
}
