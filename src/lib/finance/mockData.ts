import { DEFAULT_CURRENCY } from "./currency";
import type { Category, Purse, Transaction, FinanceState } from "./types";

// ---- Categories ---------------------------------------------------------
// IDs are stable, human-readable slugs so mock transactions can reference them.
export const mockCategories: Category[] = [
  // Level 1
  { id: "cat-food", name: "Food", parentId: null, level: 1, icon: "🍕" },
  { id: "cat-transport", name: "Transport", parentId: null, level: 1, icon: "🚌" },
  { id: "cat-fun", name: "Fun", parentId: null, level: 1, icon: "🎉" },
  { id: "cat-health", name: "Health", parentId: null, level: 1, icon: "💊" },
  { id: "cat-housing", name: "Housing", parentId: null, level: 1, icon: "🏠" },
  { id: "cat-salary", name: "Salary", parentId: null, level: 1, icon: "💼" },

  // Level 2
  { id: "cat-food-restaurant", name: "Restaurant", parentId: "cat-food", level: 2 },
  { id: "cat-food-groceries", name: "Groceries", parentId: "cat-food", level: 2 },
  { id: "cat-transport-public", name: "Public", parentId: "cat-transport", level: 2 },
  { id: "cat-transport-fuel", name: "Fuel", parentId: "cat-transport", level: 2 },
  { id: "cat-fun-movies", name: "Movies", parentId: "cat-fun", level: 2 },
  { id: "cat-fun-events", name: "Events", parentId: "cat-fun", level: 2 },
  { id: "cat-health-pharmacy", name: "Pharmacy", parentId: "cat-health", level: 2 },
  { id: "cat-health-doctor", name: "Doctor", parentId: "cat-health", level: 2 },
  { id: "cat-housing-rent", name: "Rent", parentId: "cat-housing", level: 2 },
  { id: "cat-housing-utilities", name: "Utilities", parentId: "cat-housing", level: 2 },
  { id: "cat-salary-main", name: "Main Job", parentId: "cat-salary", level: 2 },
  { id: "cat-salary-side", name: "Side Gig", parentId: "cat-salary", level: 2 },

  // Level 3 (leaf)
  { id: "cat-food-rest-fine", name: "Fine Dining", parentId: "cat-food-restaurant", level: 3 },
  { id: "cat-food-rest-fast", name: "Fast Food", parentId: "cat-food-restaurant", level: 3 },
  { id: "cat-food-rest-cafe", name: "Café", parentId: "cat-food-restaurant", level: 3 },
  { id: "cat-transport-public-bus", name: "Bus", parentId: "cat-transport-public", level: 3 },
  { id: "cat-transport-public-metro", name: "Metro", parentId: "cat-transport-public", level: 3 },
  { id: "cat-fun-events-concert", name: "Concert", parentId: "cat-fun-events", level: 3 },
  { id: "cat-housing-util-electric", name: "Electricity", parentId: "cat-housing-utilities", level: 3 },
  { id: "cat-housing-util-internet", name: "Internet", parentId: "cat-housing-utilities", level: 3 },
];

// ---- Purses -------------------------------------------------------------
export const mockPurses: Purse[] = [
  { id: "purse-bank", name: "Bank Account", isDefault: true },
  { id: "purse-cash", name: "Cash", isDefault: false },
  { id: "purse-credit", name: "Credit Card", isDefault: false },
];

// ---- Transactions -------------------------------------------------------
// Generate 36 transactions spread over the last ~90 days.
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

interface TxnSeed {
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  purseId: string;
  daysAgo: number;
  note?: string;
}

const seeds: TxnSeed[] = [
  // Income
  { type: "income", amount: 180000, categoryId: "cat-salary-main", purseId: "purse-bank", daysAgo: 2, note: "Monthly salary" },
  { type: "income", amount: 45000, categoryId: "cat-salary-side", purseId: "purse-bank", daysAgo: 14, note: "Freelance project" },
  { type: "income", amount: 180000, categoryId: "cat-salary-main", purseId: "purse-bank", daysAgo: 32, note: "Monthly salary" },
  { type: "income", amount: 22000, categoryId: "cat-salary-side", purseId: "purse-cash", daysAgo: 45 },
  { type: "income", amount: 180000, categoryId: "cat-salary-main", purseId: "purse-bank", daysAgo: 62, note: "Monthly salary" },

  // Housing (recurring)
  { type: "expense", amount: 95000, categoryId: "cat-housing-rent", purseId: "purse-bank", daysAgo: 3, note: "Monthly rent" },
  { type: "expense", amount: 95000, categoryId: "cat-housing-rent", purseId: "purse-bank", daysAgo: 33, note: "Monthly rent" },
  { type: "expense", amount: 95000, categoryId: "cat-housing-rent", purseId: "purse-bank", daysAgo: 63, note: "Monthly rent" },
  { type: "expense", amount: 12500, categoryId: "cat-housing-util-electric", purseId: "purse-bank", daysAgo: 8 },
  { type: "expense", amount: 8500, categoryId: "cat-housing-util-internet", purseId: "purse-bank", daysAgo: 8 },
  { type: "expense", amount: 11800, categoryId: "cat-housing-util-electric", purseId: "purse-bank", daysAgo: 38 },
  { type: "expense", amount: 8500, categoryId: "cat-housing-util-internet", purseId: "purse-bank", daysAgo: 38 },

  // Food
  { type: "expense", amount: 2400, categoryId: "cat-food-rest-fast", purseId: "purse-cash", daysAgo: 1, note: "Lunch with team" },
  { type: "expense", amount: 18500, categoryId: "cat-food-rest-fine", purseId: "purse-credit", daysAgo: 5, note: "Anniversary dinner" },
  { type: "expense", amount: 1200, categoryId: "cat-food-rest-cafe", purseId: "purse-cash", daysAgo: 6 },
  { type: "expense", amount: 14200, categoryId: "cat-food-groceries", purseId: "purse-bank", daysAgo: 7, note: "Weekly shop" },
  { type: "expense", amount: 3200, categoryId: "cat-food-rest-fast", purseId: "purse-cash", daysAgo: 10 },
  { type: "expense", amount: 15800, categoryId: "cat-food-groceries", purseId: "purse-bank", daysAgo: 14 },
  { type: "expense", amount: 1100, categoryId: "cat-food-rest-cafe", purseId: "purse-cash", daysAgo: 18 },
  { type: "expense", amount: 13900, categoryId: "cat-food-groceries", purseId: "purse-bank", daysAgo: 21, note: "Weekly shop" },
  { type: "expense", amount: 22000, categoryId: "cat-food-rest-fine", purseId: "purse-credit", daysAgo: 28, note: "Birthday dinner" },
  { type: "expense", amount: 16100, categoryId: "cat-food-groceries", purseId: "purse-bank", daysAgo: 35 },
  { type: "expense", amount: 2800, categoryId: "cat-food-rest-fast", purseId: "purse-cash", daysAgo: 42 },
  { type: "expense", amount: 15400, categoryId: "cat-food-groceries", purseId: "purse-bank", daysAgo: 49 },

  // Transport
  { type: "expense", amount: 800, categoryId: "cat-transport-public-bus", purseId: "purse-cash", daysAgo: 2 },
  { type: "expense", amount: 800, categoryId: "cat-transport-public-metro", purseId: "purse-cash", daysAgo: 4 },
  { type: "expense", amount: 9800, categoryId: "cat-transport-fuel", purseId: "purse-credit", daysAgo: 11, note: "Tank fill-up" },
  { type: "expense", amount: 800, categoryId: "cat-transport-public-bus", purseId: "purse-cash", daysAgo: 16 },
  { type: "expense", amount: 10500, categoryId: "cat-transport-fuel", purseId: "purse-credit", daysAgo: 30 },
  { type: "expense", amount: 800, categoryId: "cat-transport-public-metro", purseId: "purse-cash", daysAgo: 44 },

  // Fun
  { type: "expense", amount: 4500, categoryId: "cat-fun-movies", purseId: "purse-credit", daysAgo: 9, note: "Cinema" },
  { type: "expense", amount: 18000, categoryId: "cat-fun-events-concert", purseId: "purse-credit", daysAgo: 22, note: "Jazz night" },
  { type: "expense", amount: 6800, categoryId: "cat-fun-movies", purseId: "purse-credit", daysAgo: 40 },

  // Health
  { type: "expense", amount: 3400, categoryId: "cat-health-pharmacy", purseId: "purse-cash", daysAgo: 12 },
  { type: "expense", amount: 12000, categoryId: "cat-health-doctor", purseId: "purse-bank", daysAgo: 26, note: "Check-up" },
  { type: "expense", amount: 2200, categoryId: "cat-health-pharmacy", purseId: "purse-cash", daysAgo: 55 },
];

export const mockTransactions: Transaction[] = seeds
  .map((s, i): Transaction => ({
    id: `txn-${String(i + 1).padStart(5, "0")}`,
    recordNumber: String(i + 1).padStart(5, "0"),
    type: s.type,
    amount: s.amount,
    categoryId: s.categoryId,
    purseId: s.purseId,
    date: daysAgo(s.daysAgo),
    note: s.note,
    createdAt: new Date(Date.now() - s.daysAgo * 86400000).toISOString(),
  }))
  // newest first
  .sort((a, b) => b.date.localeCompare(a.date));

export const initialFinanceState: FinanceState = {
  transactions: mockTransactions,
  categories: mockCategories,
  purses: mockPurses,
  onboardingSeen: false,
  currency: DEFAULT_CURRENCY,
};
