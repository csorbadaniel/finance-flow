/**
 * Finance store — localStorage-backed, framework-agnostic.
 *
 * - Single source of truth for transactions, categories, purses, onboarding flag.
 * - Subscribers are notified on every mutation; React binding lives in `useFinance.ts`.
 * - All mutations are synchronous and validated; throws on invariant violations.
 */
import { initialFinanceState } from "./mockData";
import { DEFAULT_CURRENCY, type CurrencyCode } from "./currency";
import type { Category, FinanceState, Purse, Transaction, TransactionType } from "./types";

const STORAGE_KEY = "financeflow.state.v1";

type Listener = () => void;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadState(): FinanceState {
  if (!isBrowser()) return initialFinanceState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialFinanceState;
    const parsed = JSON.parse(raw) as FinanceState;
    // basic shape guard
    if (!parsed || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.categories) || !Array.isArray(parsed.purses)) {
      return initialFinanceState;
    }
    return { ...parsed, currency: parsed.currency ?? DEFAULT_CURRENCY };
  } catch {
    return initialFinanceState;
  }
}

function saveState(state: FinanceState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota or serialization failure — silent in MVP
  }
}

class FinanceStore {
  private state: FinanceState = initialFinanceState;
  private listeners = new Set<Listener>();
  private hydrated = false;

  private ensureHydrated(): void {
    if (this.hydrated) return;
    this.state = loadState();
    this.hydrated = true;
  }

  getState(): FinanceState {
    this.ensureHydrated();
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private commit(next: FinanceState): void {
    this.state = next;
    saveState(next);
    this.listeners.forEach((l) => l());
  }

  // ---- Transactions -----------------------------------------------------

  private nextRecordNumber(): string {
    const max = this.state.transactions.reduce((m, t) => {
      const n = parseInt(t.recordNumber, 10);
      return Number.isFinite(n) && n > m ? n : m;
    }, 0);
    return String(max + 1).padStart(5, "0");
  }

  addTransaction(input: {
    type: TransactionType;
    amount: number;
    categoryId: string;
    purseId: string;
    date: string;
    note?: string;
  }): Transaction {
    this.ensureHydrated();
    if (!(input.amount > 0)) throw new Error("Amount must be positive");
    if (!input.categoryId) throw new Error("Category required");
    if (!input.purseId) throw new Error("Purse required");
    const txn: Transaction = {
      id: `txn-${crypto.randomUUID()}`,
      recordNumber: this.nextRecordNumber(),
      type: input.type,
      amount: input.amount,
      categoryId: input.categoryId,
      purseId: input.purseId,
      date: input.date,
      note: input.note?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    this.commit({
      ...this.state,
      transactions: [txn, ...this.state.transactions],
    });
    return txn;
  }

  updateTransaction(id: string, patch: Partial<Omit<Transaction, "id" | "recordNumber" | "createdAt">>): Transaction {
    this.ensureHydrated();
    const idx = this.state.transactions.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Transaction not found: ${id}`);
    if (patch.amount !== undefined && !(patch.amount > 0)) throw new Error("Amount must be positive");
    const next = { ...this.state.transactions[idx], ...patch };
    if (patch.note !== undefined) next.note = patch.note.trim() || undefined;
    const txns = [...this.state.transactions];
    txns[idx] = next;
    this.commit({ ...this.state, transactions: txns });
    return next;
  }

  deleteTransaction(id: string): void {
    this.ensureHydrated();
    this.commit({
      ...this.state,
      transactions: this.state.transactions.filter((t) => t.id !== id),
    });
  }

  // ---- Categories -------------------------------------------------------

  addCategory(input: { name: string; parentId: string | null }): Category {
    this.ensureHydrated();
    const name = input.name.trim();
    if (!name) throw new Error("Name required");
    const parent = input.parentId ? this.state.categories.find((c) => c.id === input.parentId) : null;
    if (input.parentId && !parent) throw new Error("Parent not found");
    const level = (parent ? parent.level + 1 : 1) as 1 | 2 | 3;
    if (level > 3) throw new Error("Max depth is 3");
    const duplicate = this.state.categories.some(
      (c) => c.parentId === (input.parentId ?? null) && c.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) throw new Error("A category with this name already exists here");
    const cat: Category = {
      id: `cat-${crypto.randomUUID()}`,
      name,
      parentId: input.parentId ?? null,
      level,
    };
    this.commit({ ...this.state, categories: [...this.state.categories, cat] });
    return cat;
  }

  renameCategory(id: string, name: string): Category {
    this.ensureHydrated();
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name required");
    const cat = this.state.categories.find((c) => c.id === id);
    if (!cat) throw new Error("Category not found");
    const duplicate = this.state.categories.some(
      (c) => c.id !== id && c.parentId === cat.parentId && c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) throw new Error("A category with this name already exists here");
    const next = { ...cat, name: trimmed };
    this.commit({
      ...this.state,
      categories: this.state.categories.map((c) => (c.id === id ? next : c)),
    });
    return next;
  }

  /**
   * Deletes a category and ALL its descendants. Any transaction referencing a
   * deleted leaf is reassigned to the deleted category's parent — or, if that
   * parent is also deleted (root delete), the transaction's category becomes
   * the top-most ancestor that survives. If no ancestor survives the deletion
   * isn't allowed for top-level deletes that would orphan transactions; caller
   * must ensure reassignment target exists.
   *
   * For MVP: deleting a Level-1 with transactions inside reassigns those
   * transactions to a synthetic "Uncategorized" category created on demand.
   */
  deleteCategory(id: string): void {
    this.ensureHydrated();
    const toDelete = new Set<string>();
    const collect = (cid: string) => {
      toDelete.add(cid);
      this.state.categories.filter((c) => c.parentId === cid).forEach((c) => collect(c.id));
    };
    collect(id);

    const target = this.state.categories.find((c) => c.id === id);
    if (!target) throw new Error("Category not found");

    // Determine reassignment target: parent of the deleted root, if any.
    let reassignTo: string | null = target.parentId;
    let nextCategories = this.state.categories.filter((c) => !toDelete.has(c.id));

    if (!reassignTo && this.state.transactions.some((t) => toDelete.has(t.categoryId))) {
      // create Uncategorized once
      let uncat = nextCategories.find((c) => c.parentId === null && c.name === "Uncategorized");
      if (!uncat) {
        uncat = {
          id: `cat-${crypto.randomUUID()}`,
          name: "Uncategorized",
          parentId: null,
          level: 1,
        };
        nextCategories = [...nextCategories, uncat];
      }
      reassignTo = uncat.id;
    }

    const nextTransactions = this.state.transactions.map((t) =>
      toDelete.has(t.categoryId) && reassignTo ? { ...t, categoryId: reassignTo } : t,
    );

    this.commit({
      ...this.state,
      categories: nextCategories,
      transactions: nextTransactions,
    });
  }

  /** Returns the set of category IDs that would be deleted with this node. */
  getCategoryDescendants(id: string): string[] {
    this.ensureHydrated();
    const out: string[] = [];
    const walk = (cid: string) => {
      out.push(cid);
      this.state.categories.filter((c) => c.parentId === cid).forEach((c) => walk(c.id));
    };
    walk(id);
    return out;
  }

  // ---- Purses -----------------------------------------------------------

  addPurse(name: string): Purse {
    this.ensureHydrated();
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name required");
    if (this.state.purses.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error("A purse with this name already exists");
    }
    const purse: Purse = {
      id: `purse-${crypto.randomUUID()}`,
      name: trimmed,
      isDefault: this.state.purses.length === 0,
    };
    this.commit({ ...this.state, purses: [...this.state.purses, purse] });
    return purse;
  }

  renamePurse(id: string, name: string): Purse {
    this.ensureHydrated();
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Name required");
    const purse = this.state.purses.find((p) => p.id === id);
    if (!purse) throw new Error("Purse not found");
    if (this.state.purses.some((p) => p.id !== id && p.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error("A purse with this name already exists");
    }
    const next = { ...purse, name: trimmed };
    this.commit({
      ...this.state,
      purses: this.state.purses.map((p) => (p.id === id ? next : p)),
    });
    return next;
  }

  setDefaultPurse(id: string): void {
    this.ensureHydrated();
    if (!this.state.purses.some((p) => p.id === id)) throw new Error("Purse not found");
    this.commit({
      ...this.state,
      purses: this.state.purses.map((p) => ({ ...p, isDefault: p.id === id })),
    });
  }

  deletePurse(id: string): void {
    this.ensureHydrated();
    const remaining = this.state.purses.filter((p) => p.id !== id);
    if (remaining.length === 0) throw new Error("At least one purse must remain");
    const wasDefault = this.state.purses.find((p) => p.id === id)?.isDefault;
    // promote a fallback default
    if (wasDefault && !remaining.some((p) => p.isDefault)) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }
    // reassign transactions to fallback default
    const fallback = remaining.find((p) => p.isDefault) ?? remaining[0];
    this.commit({
      ...this.state,
      purses: remaining,
      transactions: this.state.transactions.map((t) =>
        t.purseId === id ? { ...t, purseId: fallback.id } : t,
      ),
    });
  }

  // ---- Onboarding -------------------------------------------------------

  setOnboardingSeen(seen: boolean): void {
    this.ensureHydrated();
    this.commit({ ...this.state, onboardingSeen: seen });
  }

  // ---- Preferences ------------------------------------------------------

  setCurrency(currency: CurrencyCode): void {
    this.ensureHydrated();
    this.commit({ ...this.state, currency });
  }

  // ---- Import / export --------------------------------------------------

  /** Replaces categories, purses and transactions with imported data. */
  replaceData(data: {
    categories: Category[];
    purses: Purse[];
    transactions: Transaction[];
    currency?: CurrencyCode;
  }): void {
    this.ensureHydrated();
    if (data.purses.length === 0) throw new Error("At least one purse is required");
    this.commit({
      ...this.state,
      categories: data.categories,
      purses: data.purses,
      transactions: data.transactions,
      currency: data.currency ?? this.state.currency,
    });
  }

  // ---- Test / reset -----------------------------------------------------

  /** TEST ONLY: reset to mock initial state. */
  resetToMock(): void {
    this.commit(initialFinanceState);
  }
}

export const financeStore = new FinanceStore();
